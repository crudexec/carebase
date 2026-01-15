"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { Plus, FileText, Calendar, User, Clock } from "lucide-react";
import { VisitNoteListItem } from "@/lib/visit-notes/types";

export default function VisitNotesPage() {
  const [visitNotes, setVisitNotes] = React.useState<VisitNoteListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchVisitNotes();
  }, []);

  const fetchVisitNotes = async () => {
    try {
      const response = await fetch("/api/visit-notes");
      const data = await response.json();
      if (response.ok) {
        setVisitNotes(data.visitNotes);
      }
    } catch (error) {
      console.error("Failed to fetch visit notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visit Notes</h1>
          <p className="text-foreground-secondary">
            View and submit visit notes for your shifts
          </p>
        </div>
        <Link href="/visit-notes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Visit Note
          </Button>
        </Link>
      </div>

      {/* Visit notes list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 w-3/4 rounded bg-background-secondary" />
                <div className="mt-2 h-4 w-1/2 rounded bg-background-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : visitNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-foreground-tertiary" />
            <h3 className="mt-4 text-lg font-medium">No visit notes yet</h3>
            <p className="mt-1 text-foreground-secondary">
              Submit your first visit note after a shift
            </p>
            <Link href="/visit-notes/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Visit Note
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visitNotes.map((note) => (
            <Link key={note.id} href={`/visit-notes/${note.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{note.templateName}</h3>
                        <Badge variant="default">v{note.templateVersion}</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-foreground-secondary">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {note.client.firstName} {note.client.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(note.shift.scheduledStart)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(note.shift.scheduledStart)} -{" "}
                          {formatTime(note.shift.scheduledEnd)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-foreground-tertiary">
                      Submitted {formatDate(note.submittedAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
