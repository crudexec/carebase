"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

export default function NewConversationPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        const response = await fetch(`/api/users/mentionable?search=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          // Filter out already selected users
          const filtered = data.users.filter(
            (u: User) => !selectedUsers.some((s) => s.id === u.id)
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error("Failed to search users:", err);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedUsers]);

  const handleSelectUser = (user: User) => {
    setSelectedUsers((prev) => [...prev, user]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (selectedUsers.length === 0) {
      setError("Select at least one recipient");
      return;
    }
    if (!message.trim()) {
      setError("Message is required");
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          participantIds: selectedUsers.map((u) => u.id),
          initialMessage: message.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/inbox/${data.conversation.id}`);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create conversation");
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setError("Failed to create conversation");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/inbox")} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">New Message</h1>
          <p className="text-sm text-foreground-secondary">Start a conversation with your team</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-border p-6 space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-error-light text-sm text-red-800">{error}</div>
        )}

        {/* Recipients */}
        <div className="space-y-2">
          <Label required>To</Label>
          <div className="relative">
            {/* Selected users */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map((user) => (
                  <span
                    key={user.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-primary/10 text-primary"
                  >
                    {user.firstName} {user.lastName}
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="p-0.5 rounded-full hover:bg-primary/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="pl-10"
              />
            </div>

            {/* Search results dropdown */}
            {(searchResults.length > 0 || searching) && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searching ? (
                  <div className="px-4 py-3 text-sm text-foreground-secondary">Searching...</div>
                ) : (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full px-4 py-3 text-left hover:bg-background-secondary flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-foreground-secondary">{user.role}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject" required>
            Subject
          </Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's this about?"
            maxLength={200}
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message" required>
            Message
          </Label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={6}
            className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => router.push("/inbox")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={sending}>
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </div>
    </div>
  );
}
