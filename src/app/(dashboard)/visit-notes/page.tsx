"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Breadcrumb,
  DataTable,
  DateCell,
  UserCell,
  ConfirmDeleteModal,
  type ColumnDef,
  type SortDirection,
} from "@/components/ui";
import { ClientSearchSelect } from "@/components/clients/client-search-select";
import {
  Plus,
  FileText,
  Clock,
  Search,
  RefreshCw,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Trash2,
  Send,
  CheckCircle,
} from "lucide-react";
import { VisitNoteListItem } from "@/lib/visit-notes/types";
import { toast } from "sonner";

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

// Format shift time range
function formatTimeRange(start: string, end: string) {
  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${formatTime(start)} - ${formatTime(end)}`;
}

// Calculate shift duration in hours
function getShiftDuration(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  return hours.toFixed(1);
}

// Client Cell with avatar
function ClientCell({ note }: { note: VisitNoteListItem }) {
  const initials = `${note.client.firstName[0]}${note.client.lastName[0]}`;
  const colorIndex = (note.client.firstName.charCodeAt(0) + note.client.lastName.charCodeAt(0)) % 5;
  const avatarColors = [
    "bg-primary/10 text-primary",
    "bg-success/10 text-success",
    "bg-info/10 text-info",
    "bg-warning/10 text-warning",
    "bg-error/10 text-error",
  ];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-lg ${avatarColors[colorIndex]} flex items-center justify-center flex-shrink-0 font-semibold text-xs`}
      >
        {initials}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">
          {note.client.firstName} {note.client.lastName}
        </p>
      </div>
    </div>
  );
}

// Shift Time Cell
function ShiftTimeCell({ note }: { note: VisitNoteListItem }) {
  if (!note.shift) {
    return (
      <div>
        <span className="text-sm text-foreground-tertiary">Manual Entry</span>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-foreground-tertiary" />
        <span className="text-sm">{formatTimeRange(note.shift.scheduledStart, note.shift.scheduledEnd)}</span>
      </div>
      <p className="text-xs text-foreground-tertiary mt-0.5">
        {getShiftDuration(note.shift.scheduledStart, note.shift.scheduledEnd)}h
      </p>
    </div>
  );
}

// Template Cell
function TemplateCell({ note }: { note: VisitNoteListItem }) {
  return (
    <div>
      <span className="text-sm font-medium">{note.templateName}</span>
      <div className="flex items-center gap-1 mt-0.5">
        <Badge variant="default" className="text-[10px] px-1.5 py-0">
          v{note.templateVersion}
        </Badge>
      </div>
    </div>
  );
}

export default function VisitNotesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [visitNotes, setVisitNotes] = React.useState<VisitNoteListItem[]>([]);

  // Check if user is a sponsor (GUARDIAN role)
  const isSponsor = session?.user?.role === "SPONSOR";
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedClientId, setSelectedClientId] = React.useState<string>("");
  const [sortColumn, setSortColumn] = React.useState<string | null>("submittedAt");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    noteId: string;
    clientName: string;
  }>({ isOpen: false, noteId: "", clientName: "" });
  const [deletingIds, setDeletingIds] = React.useState<Set<string>>(new Set());

  const fetchVisitNotes = React.useCallback(async () => {
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
  }, []);

  React.useEffect(() => {
    fetchVisitNotes();
  }, [fetchVisitNotes]);

  // Close action menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    if (actionMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [actionMenuOpen]);

  // Open delete confirmation modal
  const openDeleteModal = (noteId: string, clientName: string) => {
    setDeleteModal({ isOpen: true, noteId, clientName });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, noteId: "", clientName: "" });
  };

  // Delete visit note with optimistic UI
  const handleDeleteNote = async () => {
    const { noteId, clientName } = deleteModal;

    try {
      const response = await fetch(`/api/visit-notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete visit note");
      }

      // Close modal first
      closeDeleteModal();

      // Start exit animation after modal closes
      setTimeout(() => {
        setDeletingIds((prev) => new Set(prev).add(noteId));
      }, 150);

      // Remove from UI after animation
      setTimeout(() => {
        setVisitNotes((prev) => prev.filter((note) => note.id !== noteId));
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(noteId);
          return next;
        });
      }, 450);

      toast.success(`Visit note for ${clientName} deleted`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete visit note";
      toast.error(errorMessage);
      throw err; // Re-throw to keep modal open on error
    }
  };

  // Filter and sort notes
  const processedNotes = React.useMemo(() => {
    let filtered = visitNotes;

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          `${note.client.firstName} ${note.client.lastName}`.toLowerCase().includes(searchLower) ||
          note.templateName.toLowerCase().includes(searchLower) ||
          `${note.carer.firstName} ${note.carer.lastName}`.toLowerCase().includes(searchLower)
      );
    }

    // Apply client filter
    if (selectedClientId) {
      filtered = filtered.filter((note) => note.client.id === selectedClientId);
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number | Date;
        let bVal: string | number | Date;

        switch (sortColumn) {
          case "client":
            aVal = `${a.client.firstName} ${a.client.lastName}`.toLowerCase();
            bVal = `${b.client.firstName} ${b.client.lastName}`.toLowerCase();
            break;
          case "template":
            aVal = a.templateName.toLowerCase();
            bVal = b.templateName.toLowerCase();
            break;
          case "carer":
            aVal = `${a.carer.firstName} ${a.carer.lastName}`.toLowerCase();
            bVal = `${b.carer.firstName} ${b.carer.lastName}`.toLowerCase();
            break;
          case "visitDate":
            aVal = new Date(a.visitDate).getTime();
            bVal = new Date(b.visitDate).getTime();
            break;
          case "submittedAt":
            aVal = new Date(a.submittedAt).getTime();
            bVal = new Date(b.submittedAt).getTime();
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [visitNotes, searchQuery, selectedClientId, sortColumn, sortDirection]);

  const handleSortChange = (column: string, direction: SortDirection) => {
    setSortColumn(direction ? column : null);
    setSortDirection(direction);
  };

  const handleClientFilterChange = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  // Stats calculations
  const stats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    return {
      total: visitNotes.length,
      today: visitNotes.filter((n) => new Date(n.submittedAt) >= today).length,
      thisWeek: visitNotes.filter((n) => new Date(n.submittedAt) >= thisWeek).length,
    };
  }, [visitNotes]);

  const columns: ColumnDef<VisitNoteListItem>[] = [
    {
      id: "client",
      header: "Client",
      sortable: true,
      minWidth: "180px",
      cell: (row) => <ClientCell note={row} />,
    },
    {
      id: "template",
      header: "Template",
      sortable: true,
      minWidth: "160px",
      cell: (row) => <TemplateCell note={row} />,
    },
    {
      id: "visitDate",
      header: "Visit Date",
      sortable: true,
      minWidth: "120px",
      cell: (row) => <DateCell date={row.visitDate} />,
    },
    {
      id: "shiftTime",
      header: "Time",
      minWidth: "140px",
      cell: (row) => <ShiftTimeCell note={row} />,
    },
    {
      id: "carer",
      header: "Carer",
      sortable: true,
      hideOnMobile: true,
      minWidth: "160px",
      cell: (row) => (
        <UserCell firstName={row.carer.firstName} lastName={row.carer.lastName} />
      ),
    },
    {
      id: "submittedAt",
      header: "Submitted",
      sortable: true,
      hideOnMobile: true,
      minWidth: "120px",
      cell: (row) => (
        <span className="text-sm text-foreground-secondary">
          {getRelativeTime(row.submittedAt)}
        </span>
      ),
    },
  ];

  const rowActions = (row: VisitNoteListItem) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setActionMenuOpen(actionMenuOpen === row.id ? null : row.id);
        }}
        className="p-1 rounded hover:bg-background-secondary"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {actionMenuOpen === row.id && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-background border border-border z-50">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/visit-notes/${row.id}`);
              }}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </button>
            {!isSponsor && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/visit-notes/${row.id}/edit`);
                }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Download PDF
                window.open(`/api/visit-notes/${row.id}/pdf`, "_blank");
                setActionMenuOpen(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </button>
            {!isSponsor && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Send/Fax
                    setActionMenuOpen(null);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send / Fax
                </button>
                <hr className="my-1 border-border" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionMenuOpen(null);
                    openDeleteModal(row.id, `${row.client.firstName} ${row.client.lastName}`);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-background-secondary"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

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
          {!isSponsor && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Stats - Compact inline */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-semibold">{stats.total}</span>
          <span className="text-foreground-secondary">total</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          <span className="font-semibold">{stats.today}</span>
          <span className="text-foreground-secondary">today</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-info" />
          <span className="font-semibold">{stats.thisWeek}</span>
          <span className="text-foreground-secondary">this week</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-start">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
            <Input
              placeholder="Search by carer or template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-[280px]">
          <ClientSearchSelect
            value={selectedClientId}
            onChange={handleClientFilterChange}
            label=""
            placeholder="Filter by client..."
          />
        </div>
        {(searchQuery || selectedClientId) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedClientId("");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Visit Notes Table */}
      <DataTable
        data={processedNotes}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/visit-notes/${row.id}`)}
        emptyIcon={<FileText className="h-12 w-12" />}
        emptyMessage={
          searchQuery || selectedClientId
            ? "No visit notes match your filters"
            : "No visit notes yet. Create one to get started."
        }
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        rowActions={rowActions}
        stickyHeader
        getRowClassName={(row) =>
          deletingIds.has(row.id)
            ? "opacity-0 scale-95 -translate-x-4"
            : ""
        }
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteNote}
        title="Delete Visit Note"
        description="Are you sure you want to delete this visit note? All associated data including comments and files will be permanently removed."
        itemName={deleteModal.clientName ? `Visit note for ${deleteModal.clientName}` : undefined}
      />
    </div>
  );
}
