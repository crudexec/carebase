import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  mentions: z.array(z.string()).optional(), // Array of user IDs to mention
});

// Parse @mentions from comment content
function parseMentions(content: string): string[] {
  // Match @[Name](userId) pattern
  const mentionPattern = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionPattern.exec(content)) !== null) {
    mentions.push(match[2]); // Extract userId
  }
  return mentions;
}

// GET /api/visit-notes/[id]/comments - List comments for a visit note
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: visitNoteId } = await params;

    // Verify the visit note exists and belongs to the user's company
    const visitNote = await prisma.visitNote.findFirst({
      where: {
        id: visitNoteId,
        companyId: session.user.companyId,
      },
      select: { id: true },
    });

    if (!visitNote) {
      return NextResponse.json(
        { error: "Visit note not found" },
        { status: 404 }
      );
    }

    // Fetch comments with author info and mentions
    const comments = await prisma.visitNoteComment.findMany({
      where: { visitNoteId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        mentions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      comments: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        author: comment.author,
        mentions: comment.mentions.map((m) => ({
          userId: m.userId,
          user: m.user,
          seenAt: m.seenAt?.toISOString() || null,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/visit-notes/[id]/comments - Add a comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: visitNoteId } = await params;

    // Verify the visit note exists and belongs to the user's company
    const visitNote = await prisma.visitNote.findFirst({
      where: {
        id: visitNoteId,
        companyId: session.user.companyId,
      },
      select: {
        id: true,
        companyId: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!visitNote) {
      return NextResponse.json(
        { error: "Visit note not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Parse mentions from the content
    const mentionedUserIds = parseMentions(content);

    // Verify all mentioned users exist and belong to the same company
    const validMentionedUsers = await prisma.user.findMany({
      where: {
        id: { in: mentionedUserIds },
        companyId: session.user.companyId,
        isActive: true,
      },
      select: { id: true, firstName: true, lastName: true },
    });

    const validUserIds = validMentionedUsers.map((u) => u.id);

    // Create the comment with mentions
    const comment = await prisma.visitNoteComment.create({
      data: {
        content,
        companyId: visitNote.companyId,
        visitNoteId,
        authorId: session.user.id,
        mentions: {
          create: validUserIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        mentions: {
          include: {
            user: {
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

    // Create notifications for mentioned users
    if (validUserIds.length > 0) {
      const authorName = `${session.user.firstName} ${session.user.lastName}`;
      const clientName = `${visitNote.client.firstName} ${visitNote.client.lastName}`;

      await prisma.notification.createMany({
        data: validUserIds.map((userId) => ({
          companyId: visitNote.companyId,
          userId,
          type: "COMMENT_MENTION",
          title: "You were mentioned in a comment",
          message: `${authorName} mentioned you in a comment on a visit note for ${clientName}`,
          link: `/visit-notes/${visitNoteId}`,
        })),
      });
    }

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
          author: comment.author,
          mentions: comment.mentions.map((m) => ({
            userId: m.userId,
            user: m.user,
            seenAt: null,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
