"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mail, Plus, Archive, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface LastMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Conversation {
  id: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  lastMessage: LastMessage | null;
  hasUnread: boolean;
  isArchived: boolean;
}

export default function InboxPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "archived">("all");

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter === "archived" ? "?archived=true" : "";
      const response = await fetch(`/api/inbox${params}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const unreadCount = conversations.filter((c) => c.hasUnread).length;

  const getParticipantNames = (participants: Participant[], maxShow = 3) => {
    if (participants.length <= maxShow) {
      return participants.map((p) => `${p.firstName} ${p.lastName}`).join(", ");
    }
    const shown = participants.slice(0, maxShow);
    const remaining = participants.length - maxShow;
    return `${shown.map((p) => `${p.firstName} ${p.lastName}`).join(", ")} +${remaining}`;
  };

  const getInitials = (participants: Participant[]) => {
    if (participants.length === 1) {
      return `${participants[0].firstName[0]}${participants[0].lastName[0]}`;
    }
    return participants
      .slice(0, 2)
      .map((p) => p.firstName[0])
      .join("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Messages</h1>
          <p className="text-sm text-foreground-secondary">
            {unreadCount > 0
              ? `${unreadCount} unread conversation${unreadCount !== 1 ? "s" : ""}`
              : "Your internal messages"}
          </p>
        </div>
        <Button onClick={() => router.push("/inbox/new")}>
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          <Mail className="w-4 h-4 mr-1.5" />
          Inbox
        </Button>
        <Button
          variant={filter === "archived" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("archived")}
        >
          <Archive className="w-4 h-4 mr-1.5" />
          Archived
        </Button>
      </div>

      {/* Conversations list */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-foreground-secondary">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Mail className="w-12 h-12 mx-auto text-foreground-secondary/30 mb-3" />
            <p className="text-foreground-secondary mb-4">
              {filter === "archived"
                ? "No archived conversations"
                : "No conversations yet"}
            </p>
            {filter === "all" && (
              <Button variant="secondary" onClick={() => router.push("/inbox/new")}>
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  onClick={() => router.push(`/inbox/${conversation.id}`)}
                  className={cn(
                    "w-full px-4 py-4 text-left hover:bg-background-secondary transition-colors flex gap-4",
                    conversation.hasUnread && "bg-primary/5"
                  )}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                    {conversation.participants.length > 2 ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      getInitials(conversation.participants)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Participants */}
                        <p
                          className={cn(
                            "text-sm truncate",
                            conversation.hasUnread
                              ? "text-foreground font-semibold"
                              : "text-foreground-secondary"
                          )}
                        >
                          {getParticipantNames(conversation.participants)}
                        </p>

                        {/* Subject */}
                        <p
                          className={cn(
                            "text-sm truncate mt-0.5",
                            conversation.hasUnread
                              ? "text-foreground font-medium"
                              : "text-foreground"
                          )}
                        >
                          {conversation.subject}
                        </p>

                        {/* Last message preview */}
                        {conversation.lastMessage && (
                          <p className="text-sm text-foreground-secondary truncate mt-1">
                            <span className="text-foreground-secondary/70">
                              {conversation.lastMessage.sender.firstName}:
                            </span>{" "}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>

                      {/* Time and unread indicator */}
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-foreground-secondary whitespace-nowrap">
                          {formatDistanceToNow(new Date(conversation.updatedAt), {
                            addSuffix: false,
                          })}
                        </span>
                        {conversation.hasUnread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
