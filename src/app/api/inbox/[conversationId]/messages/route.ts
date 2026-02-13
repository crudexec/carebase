import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendNotification } from "@/lib/notifications";

// Schema for sending a message
const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

// POST /api/inbox/[conversationId]/messages - Send a message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const body = await request.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Get conversation with all participants
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        companyId: user.companyId,
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create message and update conversation
    const [message] = await prisma.$transaction([
      prisma.inboxMessage.create({
        data: {
          content,
          conversationId,
          senderId: user.id,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
      // Update sender's lastReadAt
      prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: user.id,
          },
        },
        data: { lastReadAt: new Date() },
      }),
    ]);

    // Send notifications to other participants
    const recipientIds = conversation.participants
      .map((p) => p.userId)
      .filter((id) => id !== user.id);

    if (recipientIds.length > 0) {
      await sendNotification({
        eventType: "NEW_INBOX_MESSAGE",
        recipientIds,
        channels: ["IN_APP"],
        data: {
          senderName: `${user.firstName} ${user.lastName}`,
          subject: conversation.subject,
          messagePreview: content.substring(0, 50),
          conversationUrl: `/inbox/${conversationId}`,
        },
        relatedEntityType: "Conversation",
        relatedEntityId: conversationId,
      });
    }

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        sender: message.sender,
        isOwn: true,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
