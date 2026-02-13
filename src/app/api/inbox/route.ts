import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendNotification } from "@/lib/notifications";

// Query schema for listing conversations
const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  archived: z.enum(["true", "false"]).optional(),
});

// Schema for creating a new conversation
const createConversationSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  participantIds: z.array(z.string()).min(1, "At least one recipient is required"),
  initialMessage: z.string().min(1, "Message is required"),
});

// GET /api/inbox - List conversations
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryResult = listQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, archived } = queryResult.data;
    const isArchived = archived === "true";

    // Get conversations where user is a participant
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          companyId: user.companyId,
          participants: {
            some: {
              userId: user.id,
              isArchived,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.conversation.count({
        where: {
          companyId: user.companyId,
          participants: {
            some: {
              userId: user.id,
              isArchived,
            },
          },
        },
      }),
    ]);

    // Transform to include unread status
    const response = conversations.map((conv) => {
      const userParticipant = conv.participants.find((p) => p.userId === user.id);
      const lastMessage = conv.messages[0];
      const hasUnread = lastMessage && userParticipant?.lastReadAt
        ? new Date(lastMessage.createdAt) > new Date(userParticipant.lastReadAt)
        : !!lastMessage && !userParticipant?.lastReadAt;

      return {
        id: conv.id,
        subject: conv.subject,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        createdBy: conv.createdBy,
        participants: conv.participants.map((p) => ({
          id: p.user.id,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          role: p.user.role,
        })),
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content.substring(0, 100),
              createdAt: lastMessage.createdAt.toISOString(),
              sender: lastMessage.sender,
            }
          : null,
        hasUnread,
        isArchived: userParticipant?.isArchived ?? false,
      };
    });

    return NextResponse.json({
      conversations: response,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing conversations:", error);
    return NextResponse.json(
      { error: "Failed to list conversations" },
      { status: 500 }
    );
  }
}

// POST /api/inbox - Create a new conversation
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { subject, participantIds, initialMessage } = validation.data;

    // Verify all participants are in the same company
    const participants = await prisma.user.findMany({
      where: {
        id: { in: participantIds },
        companyId: user.companyId,
        isActive: true,
      },
      select: { id: true, firstName: true, lastName: true },
    });

    if (participants.length !== participantIds.length) {
      return NextResponse.json(
        { error: "One or more recipients are invalid or not in your company" },
        { status: 400 }
      );
    }

    // Create conversation with participants and initial message
    const allParticipantIds = [...new Set([user.id, ...participantIds])];

    const conversation = await prisma.conversation.create({
      data: {
        subject,
        companyId: user.companyId,
        createdById: user.id,
        participants: {
          create: allParticipantIds.map((userId) => ({
            userId,
            lastReadAt: userId === user.id ? new Date() : null,
          })),
        },
        messages: {
          create: {
            content: initialMessage,
            senderId: user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Send notifications to other participants
    const recipientIds = participantIds.filter((id) => id !== user.id);
    if (recipientIds.length > 0) {
      await sendNotification({
        eventType: "NEW_INBOX_MESSAGE",
        recipientIds,
        channels: ["IN_APP"],
        data: {
          senderName: `${user.firstName} ${user.lastName}`,
          subject,
          messagePreview: initialMessage.substring(0, 50),
          conversationUrl: `/inbox/${conversation.id}`,
        },
        relatedEntityType: "Conversation",
        relatedEntityId: conversation.id,
      });
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        subject: conversation.subject,
        createdAt: conversation.createdAt.toISOString(),
        participants: conversation.participants.map((p) => ({
          id: p.user.id,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          role: p.user.role,
        })),
        messages: conversation.messages.map((m) => ({
          id: m.id,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
          sender: m.sender,
        })),
      },
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
