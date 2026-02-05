"use client";

import * as React from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight, Loader2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  subject: string;
  lastMessageAt: string;
  unreadCount: number;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
  lastMessage?: {
    content: string;
    sender: {
      firstName: string;
      lastName: string;
    };
  };
}

export function InboxWidget() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [unreadTotal, setUnreadTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchInbox = async () => {
      try {
        const [inboxRes, unreadRes] = await Promise.all([
          fetch("/api/inbox?limit=5"),
          fetch("/api/inbox/unread-count"),
        ]);

        if (inboxRes.ok) {
          const data = await inboxRes.json();
          setConversations(data.conversations || []);
        }

        if (unreadRes.ok) {
          const data = await unreadRes.json();
          setUnreadTotal(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch inbox:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInbox();
  }, []);

  return (
    <div className="rounded-lg border border-border-light bg-background-tertiary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Inbox</h3>
          {unreadTotal > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-white">
              {unreadTotal} new
            </span>
          )}
        </div>
        <Link
          href="/inbox"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-foreground-secondary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-foreground-secondary">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <Link href="/inbox/new" className="text-xs text-primary hover:underline mt-1 inline-block">
              Start a conversation
            </Link>
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conversation) => {
              const otherParticipants = conversation.participants.slice(0, 2);
              const hasUnread = conversation.unreadCount > 0;

              return (
                <li key={conversation.id}>
                  <Link
                    href={`/inbox/${conversation.id}`}
                    className={`block px-3 py-2 rounded-md transition-colors ${
                      hasUnread
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-background-secondary"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {otherParticipants.length > 0 ? (
                          <span className="text-xs font-medium text-primary">
                            {otherParticipants[0].firstName[0]}
                            {otherParticipants[0].lastName[0]}
                          </span>
                        ) : (
                          <User className="w-4 h-4 text-primary" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm truncate ${
                              hasUnread ? "font-semibold text-foreground" : "text-foreground"
                            }`}
                          >
                            {conversation.subject || "No subject"}
                          </p>
                          {hasUnread && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-foreground-secondary truncate">
                          {conversation.lastMessage ? (
                            <>
                              <span className="font-medium">
                                {conversation.lastMessage.sender.firstName}:
                              </span>{" "}
                              {conversation.lastMessage.content}
                            </>
                          ) : (
                            otherParticipants.map((p) => `${p.firstName} ${p.lastName}`).join(", ")
                          )}
                        </p>
                        {conversation.lastMessageAt && !isNaN(new Date(conversation.lastMessageAt).getTime()) && (
                          <p className="text-[10px] text-foreground-tertiary mt-0.5">
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                              addSuffix: true,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer - New Message Button */}
      {conversations.length > 0 && (
        <div className="px-4 py-3 border-t border-border-light">
          <Link
            href="/inbox/new"
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-md transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            New Message
          </Link>
        </div>
      )}
    </div>
  );
}
