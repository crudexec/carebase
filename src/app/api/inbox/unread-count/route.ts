import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/inbox/unread-count - Get count of unread conversations
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all user's non-archived participations with their last read time
    const participations = await prisma.conversationParticipant.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
        conversation: {
          companyId: session.user.companyId,
        },
      },
      select: {
        conversationId: true,
        lastReadAt: true,
        conversation: {
          select: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                createdAt: true,
                senderId: true,
              },
            },
          },
        },
      },
    });

    // Count conversations with unread messages
    const unreadCount = participations.filter((p) => {
      const lastMessage = p.conversation.messages[0];
      if (!lastMessage) return false;

      // Don't count as unread if the user sent the last message
      if (lastMessage.senderId === session.user.id) return false;

      // Unread if no lastReadAt or lastReadAt is before the last message
      if (!p.lastReadAt) return true;
      return new Date(lastMessage.createdAt) > new Date(p.lastReadAt);
    }).length;

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Error getting unread count:", error);
    return NextResponse.json(
      { error: "Failed to get unread count" },
      { status: 500 }
    );
  }
}
