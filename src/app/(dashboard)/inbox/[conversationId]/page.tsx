"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, Users, Archive, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
  isOwn: boolean;
}

interface Conversation {
  id: string;
  subject: string;
  createdAt: string;
  participants: Participant[];
  messages: Message[];
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchConversation = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inbox/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
      } else if (response.status === 404) {
        router.push("/inbox");
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, router]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch(`/api/inbox/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, data.message],
              }
            : null
        );
        setNewMessage("");
        textareaRef.current?.focus();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleArchive = async () => {
    try {
      await fetch(`/api/inbox/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      router.push("/inbox");
    } catch (error) {
      console.error("Failed to archive conversation:", error);
    }
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, "h:mm a");
    }
    if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    }
    return format(date, "MMM d, h:mm a");
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; label: string; messages: Message[] }[] = [];
    let currentGroup: typeof groups[0] | null = null;

    messages.forEach((message) => {
      const date = format(new Date(message.createdAt), "yyyy-MM-dd");
      const messageDate = new Date(message.createdAt);
      let label: string;

      if (isToday(messageDate)) {
        label = "Today";
      } else if (isYesterday(messageDate)) {
        label = "Yesterday";
      } else {
        label = format(messageDate, "EEEE, MMMM d");
      }

      if (!currentGroup || currentGroup.date !== date) {
        currentGroup = { date, label, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(message);
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-foreground-secondary">Loading conversation...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-foreground-secondary">Conversation not found</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(conversation.messages);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/inbox")} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{conversation.subject}</h1>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-sm text-foreground-secondary hover:text-foreground flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              {conversation.participants.length} participant
              {conversation.participants.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleArchive} title="Archive conversation">
            <Archive className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Participants dropdown */}
      {showParticipants && (
        <div className="py-3 px-4 bg-background-secondary border-b border-border">
          <p className="text-xs font-medium text-foreground-secondary mb-2">Participants</p>
          <div className="flex flex-wrap gap-2">
            {conversation.participants.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white border border-border"
              >
                {p.firstName} {p.lastName}
                <span className="ml-1.5 text-foreground-secondary">({p.role})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        {messageGroups.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-foreground-secondary">{group.label}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Messages */}
            <div className="space-y-3">
              {group.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-4 py-2.5",
                      message.isOwn
                        ? "bg-primary text-white"
                        : "bg-background-secondary text-foreground"
                    )}
                  >
                    {!message.isOwn && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.sender.firstName} {message.sender.lastName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        message.isOwn ? "text-white/70" : "text-foreground-secondary"
                      )}
                    >
                      {formatMessageDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="pt-4 border-t border-border">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            style={{ minHeight: "48px", maxHeight: "150px" }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-foreground-secondary mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
