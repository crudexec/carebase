import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
});

// Parse @mentions from comment content
function parseMentions(content: string): string[] {
  const mentionPattern = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionPattern.exec(content)) !== null) {
    mentions.push(match[2]);
  }
  return mentions;
}

// PATCH /api/visit-notes/[id]/comments/[commentId] - Update a comment
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: visitNoteId, commentId } = await params;

    // Get the comment
    const existingComment = await prisma.visitNoteComment.findFirst({
      where: {
        id: commentId,
        visitNoteId,
        companyId: session.user.companyId,
      },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Only the author can edit their comment
    if (existingComment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own comments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Parse new mentions
    const newMentionedUserIds = parseMentions(content);

    // Get existing mentions
    const existingMentions = await prisma.commentMention.findMany({
      where: { commentId },
      select: { userId: true },
    });
    const existingMentionIds = existingMentions.map((m) => m.userId);

    // Find new mentions to add
    const mentionsToAdd = newMentionedUserIds.filter(
      (id) => !existingMentionIds.includes(id)
    );

    // Find mentions to remove
    const mentionsToRemove = existingMentionIds.filter(
      (id) => !newMentionedUserIds.includes(id)
    );

    // Verify new mentioned users exist and belong to the same company
    const validNewUsers = await prisma.user.findMany({
      where: {
        id: { in: mentionsToAdd },
        companyId: session.user.companyId,
        isActive: true,
      },
      select: { id: true },
    });
    const validNewUserIds = validNewUsers.map((u) => u.id);

    // Update comment and mentions in a transaction
    const [comment] = await prisma.$transaction([
      prisma.visitNoteComment.update({
        where: { id: commentId },
        data: { content },
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
      }),
      // Remove old mentions
      prisma.commentMention.deleteMany({
        where: {
          commentId,
          userId: { in: mentionsToRemove },
        },
      }),
      // Add new mentions
      ...validNewUserIds.map((userId) =>
        prisma.commentMention.create({
          data: {
            commentId,
            userId,
          },
        })
      ),
    ]);

    // Notify newly mentioned users
    if (validNewUserIds.length > 0) {
      const visitNote = await prisma.visitNote.findUnique({
        where: { id: visitNoteId },
        select: {
          companyId: true,
          client: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      if (visitNote) {
        const authorName = `${session.user.firstName} ${session.user.lastName}`;
        const clientName = `${visitNote.client.firstName} ${visitNote.client.lastName}`;

        await prisma.notification.createMany({
          data: validNewUserIds.map((userId) => ({
            companyId: visitNote.companyId,
            userId,
            type: "COMMENT_MENTION",
            title: "You were mentioned in a comment",
            message: `${authorName} mentioned you in a comment on a visit note for ${clientName}`,
            link: `/visit-notes/${visitNoteId}`,
          })),
        });
      }
    }

    // Refetch to get updated mentions
    const updatedComment = await prisma.visitNoteComment.findUnique({
      where: { id: commentId },
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

    return NextResponse.json({
      comment: {
        id: updatedComment!.id,
        content: updatedComment!.content,
        createdAt: updatedComment!.createdAt.toISOString(),
        updatedAt: updatedComment!.updatedAt.toISOString(),
        author: updatedComment!.author,
        mentions: updatedComment!.mentions.map((m) => ({
          userId: m.userId,
          user: m.user,
          seenAt: m.seenAt?.toISOString() || null,
        })),
      },
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// DELETE /api/visit-notes/[id]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: visitNoteId, commentId } = await params;

    // Get the comment
    const existingComment = await prisma.visitNoteComment.findFirst({
      where: {
        id: commentId,
        visitNoteId,
        companyId: session.user.companyId,
      },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Only the author or admins can delete comments
    const isAuthor = existingComment.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "OPS_MANAGER";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    // Delete the comment (mentions will cascade delete)
    await prisma.visitNoteComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
