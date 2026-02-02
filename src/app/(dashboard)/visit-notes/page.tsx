"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Card, CardContent, Badge, Input, Select, Breadcrumb } from "@/components/ui";
import {
  Plus,
  FileText,
  Calendar,
  User,
  Clock,
  Search,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { VisitNoteListItem } from "@/lib/visit-notes/types";

// Group visit notes by date
function groupByDate(notes: VisitNoteListItem[]) {
  const groups: Record<string, VisitNoteListItem[]> = {};

  notes.forEach((note) => {
    const date = new Date(note.shift.scheduledStart).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(note);
  });

  return Object.entries(groups).sort((a, b) => {
    return new Date(b[1][0].shift.scheduledStart).getTime() - new Date(a[1][0].shift.scheduledStart).getTime();
  });
}

// Relative time helper
function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Visit Note Card Component
function VisitNoteCard({ note, isFirst }: { note: VisitNoteListItem; isFirst: boolean }) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate initials for avatar
  const initials = `${note.client.firstName[0]}${note.client.lastName[0]}`;

  // Random but consistent color based on client name
  const colorIndex = (note.client.firstName.charCodeAt(0) + note.client.lastName.charCodeAt(0)) % 5;
  const avatarColors = [
    "bg-primary/10 text-primary",
    "bg-success/10 text-success",
    "bg-info/10 text-info",
    "bg-warning/10 text-warning",
    "bg-error/10 text-error",
  ];

  return (
    <Link href={`/visit-notes/${note.id}`}>
      <div className="relative">
        {/* Timeline connector */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border last:hidden" style={{ height: "calc(100% + 16px)" }} />

        {/* Timeline dot */}
        <div className={`absolute left-4 top-6 w-5 h-5 rounded-full border-2 border-background-tertiary z-10 ${isFirst ? "bg-primary" : "bg-border"}`} />

        <div className="ml-12 bg-background-tertiary border border-border rounded-xl p-5 cursor-pointer">
          <div className="flex items-start gap-4">
            {/* Client Avatar */}
            <div className={`w-12 h-12 rounded-xl ${avatarColors[colorIndex]} flex items-center justify-center flex-shrink-0 font-semibold text-sm`}>
              {initials}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {note.client.firstName} {note.client.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-foreground-secondary bg-background-secondary px-2 py-0.5 rounded-md">
                      {note.templateName}
                    </span>
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                      v{note.templateVersion}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground-tertiary whitespace-nowrap">
                    {getRelativeTime(note.submittedAt)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-foreground-tertiary" />
                </div>
              </div>

              {/* Meta Information */}
              <div className="flex items-center gap-4 mt-3 text-xs text-foreground-secondary">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-foreground-tertiary" />
                  <span>
                    {formatTime(note.shift.scheduledStart)} - {formatTime(note.shift.scheduledEnd)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-foreground-tertiary" />
                  <span>
                    {note.carer.firstName} {note.carer.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="ml-12 animate-pulse">
          <div className="bg-background-tertiary border border-border rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-background-secondary" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-1/3 rounded bg-background-secondary" />
                <div className="h-4 w-1/2 rounded bg-background-secondary" />
                <div className="h-3 w-2/3 rounded bg-background-secondary" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No visit notes yet</h3>
      <p className="text-foreground-secondary text-center max-w-sm mb-6">
        Visit notes help you track care activities and maintain detailed records for each client visit.
      </p>
      <Link href="/visit-notes/new">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Note
        </Button>
      </Link>
    </div>
  );
}

export default function VisitNotesPage() {
  const [visitNotes, setVisitNotes] = React.useState<VisitNoteListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedClient, setSelectedClient] = React.useState<string>("");

  React.useEffect(() => {
    fetchVisitNotes();
  }, []);

  const fetchVisitNotes = async () => {
    try {
      setIsLoading(true);
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

  // Filter notes based on search and filters
  const filteredNotes = React.useMemo(() => {
    return visitNotes.filter((note) => {
      const matchesSearch = !searchQuery ||
        `${note.client.firstName} ${note.client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${note.carer.firstName} ${note.carer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClient = !selectedClient || note.client.id === selectedClient;

      return matchesSearch && matchesClient;
    });
  }, [visitNotes, searchQuery, selectedClient]);

  // Get unique clients for filter
  const uniqueClients = React.useMemo(() => {
    const clients = new Map();
    visitNotes.forEach((note) => {
      if (!clients.has(note.client.id)) {
        clients.set(note.client.id, note.client);
      }
    });
    return Array.from(clients.values());
  }, [visitNotes]);

  const groupedNotes = groupByDate(filteredNotes);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Visit Notes" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visit Notes</h1>
          <p className="text-foreground-secondary text-sm mt-1">
            Track and document care activities for your shifts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchVisitNotes}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link href="/visit-notes/templates">
            <Button variant="secondary" size="sm">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </Link>
          <Link href="/visit-notes/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </Link>
        </div>
      </div>


      {/* Search and Filters */}
      {!isLoading && visitNotes.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
                <Input
                  placeholder="Search by client, carer, or template..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full sm:w-48"
                >
                  <option value="">All Clients</option>
                  {uniqueClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Active filters indicator */}
            {(searchQuery || selectedClient) && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <span className="text-xs text-foreground-tertiary">Showing {filteredNotes.length} of {visitNotes.length} notes</span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedClient("");
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Visit Notes List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : visitNotes.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState />
          </CardContent>
        </Card>
      ) : filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-foreground-tertiary mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-1">No results found</h3>
            <p className="text-sm text-foreground-secondary">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedNotes.map(([date, notes]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background-secondary rounded-lg">
                  <Calendar className="w-4 h-4 text-foreground-tertiary" />
                  <span className="text-sm font-medium text-foreground">{date}</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-foreground-tertiary">
                  {notes.length} {notes.length === 1 ? "note" : "notes"}
                </span>
              </div>

              {/* Notes for this date */}
              <div className="space-y-4">
                {notes.map((note, index) => (
                  <VisitNoteCard key={note.id} note={note} isFirst={index === 0} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
