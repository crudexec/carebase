"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Select,
  Badge,
  Textarea,
  Breadcrumb,
} from "@/components/ui";
import {
  Search,
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";

interface QAItem {
  id: string;
  type: "assessment" | "visit-note";
  templateName: string;
  clientName: string;
  clientId: string;
  submitterName: string;
  submittedAt: string;
  qaStatus: string;
  qaComment?: string;
  qaReviewedAt?: string;
  qaReviewerName?: string;
  // Additional fields for assessments
  assessmentType?: string;
  // Additional fields for visit notes
  shiftStart?: string;
  shiftEnd?: string;
}

interface QAStats {
  pendingAssessments: number;
  pendingVisitNotes: number;
  approvedToday: number;
  rejectedToday: number;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  PENDING_REVIEW: { label: "Pending", color: "text-warning", bgColor: "bg-warning/10", icon: Clock },
  APPROVED: { label: "Approved", color: "text-success", bgColor: "bg-success/10", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "text-error", bgColor: "bg-error/10", icon: XCircle },
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  assessment: { label: "Assessment", color: "text-primary", bgColor: "bg-primary/10" },
  "visit-note": { label: "Visit Note", color: "text-secondary", bgColor: "bg-secondary/10" },
};

// Skeleton loader for table rows
function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-border animate-pulse">
          <td className="px-4 py-3">
            <div className="h-5 bg-background-secondary rounded w-24" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 bg-background-secondary rounded w-32" />
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-background-secondary" />
              <div className="h-5 bg-background-secondary rounded w-28" />
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="h-5 bg-background-secondary rounded w-24" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 bg-background-secondary rounded w-28" />
          </td>
          <td className="px-4 py-3">
            <div className="h-6 bg-background-secondary rounded w-20" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 bg-background-secondary rounded w-28" />
          </td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <div className="h-8 bg-background-secondary rounded w-16" />
              <div className="h-8 bg-background-secondary rounded w-16" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// Skeleton loader for stats cards
function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 animate-pulse">
              <div className="p-3 rounded-full bg-background-secondary w-12 h-12" />
              <div>
                <div className="h-7 bg-background-secondary rounded w-12 mb-2" />
                <div className="h-4 bg-background-secondary rounded w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function QAManagerPage() {
  const [items, setItems] = React.useState<QAItem[]>([]);
  const [stats, setStats] = React.useState<QAStats>({
    pendingAssessments: 0,
    pendingVisitNotes: 0,
    approvedToday: 0,
    rejectedToday: 0,
  });
  const [clients, setClients] = React.useState<Client[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isStatsLoading, setIsStatsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("PENDING_REVIEW");
  const [clientFilter, setClientFilter] = React.useState<string>("");
  const [clientSearch, setClientSearch] = React.useState("");
  const [showClientDropdown, setShowClientDropdown] = React.useState(false);
  const clientDropdownRef = React.useRef<HTMLDivElement>(null);

  // Get selected client name for display
  const selectedClient = clients.find((c) => c.id === clientFilter);
  const filteredClients = clients.filter((client) => {
    if (!clientSearch) return true;
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    return fullName.includes(clientSearch.toLowerCase());
  });

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Review modal state
  const [reviewModal, setReviewModal] = React.useState<{
    open: boolean;
    item: QAItem | null;
    action: "approve" | "reject" | null;
  }>({ open: false, item: null, action: null });
  const [reviewComment, setReviewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetchClients();
  }, []);

  React.useEffect(() => {
    fetchQAItems();
  }, [typeFilter, statusFilter, clientFilter]);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients?limit=500");
      const data = await response.json();
      if (response.ok && data.clients) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  const fetchQAItems = async () => {
    setIsLoading(true);
    setIsStatsLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (clientFilter) params.set("clientId", clientFilter);

      const response = await fetch(`/api/qa?${params}`);
      const data = await response.json();

      if (response.ok) {
        // Transform assessments and visit notes into unified items
        const assessmentItems: QAItem[] = (data.assessments || []).map((a: any) => ({
          id: a.id,
          type: "assessment" as const,
          templateName: a.template?.name || "Unknown",
          clientName: `${a.client?.firstName || ""} ${a.client?.lastName || ""}`.trim(),
          clientId: a.clientId,
          submitterName: `${a.assessor?.firstName || ""} ${a.assessor?.lastName || ""}`.trim(),
          submittedAt: a.submittedForQAAt || a.completedAt || a.startedAt,
          qaStatus: a.qaStatus,
          qaComment: a.qaComment,
          qaReviewedAt: a.qaReviewedAt,
          qaReviewerName: a.qaReviewedBy
            ? `${a.qaReviewedBy.firstName} ${a.qaReviewedBy.lastName}`
            : undefined,
          assessmentType: a.assessmentType,
        }));

        const visitNoteItems: QAItem[] = (data.visitNotes || []).map((v: any) => ({
          id: v.id,
          type: "visit-note" as const,
          templateName: v.template?.name || "Unknown",
          clientName: `${v.client?.firstName || ""} ${v.client?.lastName || ""}`.trim(),
          clientId: v.clientId,
          submitterName: `${v.carer?.firstName || ""} ${v.carer?.lastName || ""}`.trim(),
          submittedAt: v.submittedAt,
          qaStatus: v.qaStatus,
          qaComment: v.qaComment,
          qaReviewedAt: v.qaReviewedAt,
          qaReviewerName: v.qaReviewedBy
            ? `${v.qaReviewedBy.firstName} ${v.qaReviewedBy.lastName}`
            : undefined,
          shiftStart: v.shift?.scheduledStart,
          shiftEnd: v.shift?.scheduledEnd,
        }));

        // Combine and sort by submission date
        const allItems = [...assessmentItems, ...visitNoteItems].sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );

        setItems(allItems);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Failed to fetch QA items:", error);
    } finally {
      setIsLoading(false);
      setIsStatsLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewModal.item || !reviewModal.action) return;

    setIsSubmitting(true);
    try {
      const endpoint =
        reviewModal.item.type === "assessment"
          ? `/api/qa/assessments/${reviewModal.item.id}`
          : `/api/qa/visit-notes/${reviewModal.item.id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewModal.action === "approve" ? "APPROVED" : "REJECTED",
          comment: reviewComment,
        }),
      });

      if (response.ok) {
        setReviewModal({ open: false, item: null, action: null });
        setReviewComment("");
        fetchQAItems();
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewModal = (item: QAItem, action: "approve" | "reject") => {
    setReviewModal({ open: true, item, action });
    setReviewComment("");
  };

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.clientName.toLowerCase().includes(searchLower) ||
      item.templateName.toLowerCase().includes(searchLower) ||
      item.submitterName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "QA Manager" }]} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">QA Manager</h1>
        <p className="text-foreground-secondary">
          Review and approve assessments and visit notes
        </p>
      </div>

      {/* Stats Cards */}
      {isStatsLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.pendingAssessments + stats.pendingVisitNotes}
                  </p>
                  <p className="text-sm text-foreground-secondary">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingAssessments}</p>
                  <p className="text-sm text-foreground-secondary">Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <FileText className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingVisitNotes}</p>
                  <p className="text-sm text-foreground-secondary">Visit Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approvedToday}</p>
                  <p className="text-sm text-foreground-secondary">Approved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                <Input
                  placeholder="Search by client, template, or submitter..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            {/* Searchable Client Selector */}
            <div className="relative w-[220px]" ref={clientDropdownRef}>
              <div
                className="flex h-9 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm cursor-pointer hover:border-primary/50"
                onClick={() => setShowClientDropdown(!showClientDropdown)}
              >
                <span className={selectedClient ? "text-foreground" : "text-foreground-secondary"}>
                  {selectedClient
                    ? `${selectedClient.firstName} ${selectedClient.lastName}`
                    : "Select Client"}
                </span>
                <div className="flex items-center gap-1">
                  {clientFilter && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setClientFilter("");
                        setClientSearch("");
                      }}
                      className="p-0.5 hover:bg-gray-100 rounded"
                    >
                      <X className="h-3 w-3 text-foreground-secondary" />
                    </button>
                  )}
                  <ChevronDown className="h-4 w-4 text-foreground-secondary" />
                </div>
              </div>
              {showClientDropdown && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Search clients..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="h-8"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-foreground-secondary"
                      onClick={() => {
                        setClientFilter("");
                        setClientSearch("");
                        setShowClientDropdown(false);
                      }}
                    >
                      All Clients
                    </button>
                    {filteredClients.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-foreground-secondary">
                        No clients found
                      </div>
                    ) : (
                      filteredClients.map((client) => (
                        <button
                          key={client.id}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                            clientFilter === client.id ? "bg-primary/10 text-primary" : ""
                          }`}
                          onClick={() => {
                            setClientFilter(client.id);
                            setClientSearch("");
                            setShowClientDropdown(false);
                          }}
                        >
                          {client.firstName} {client.lastName}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-[180px]"
            >
              <option value="">All Types</option>
              <option value="assessments">Assessments</option>
              <option value="visit-notes">Visit Notes</option>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[180px]"
            >
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="">All Statuses</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* QA Items Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Items for Review ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background-secondary/50">
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Template</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Client</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Submitted By</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Submitted</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Reviewer</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <TableSkeleton />
                </tbody>
              </table>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="mx-auto h-12 w-12 text-foreground-secondary/50" />
              <h3 className="mt-4 text-lg font-medium">No items to review</h3>
              <p className="mt-2 text-sm text-foreground-secondary">
                {statusFilter === "PENDING_REVIEW"
                  ? "All items have been reviewed"
                  : "No items match your filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background-secondary/50">
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Template</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Client</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Submitted By</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Submitted</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Reviewer</th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => {
                    const statusConfig = STATUS_CONFIG[item.qaStatus] || STATUS_CONFIG.PENDING_REVIEW;
                    const typeConfig = TYPE_CONFIG[item.type];
                    const StatusIcon = statusConfig.icon;
                    const isPending = item.qaStatus === "PENDING_REVIEW";

                    return (
                      <tr
                        key={`${item.type}-${item.id}`}
                        className="hover:bg-background-secondary/30 transition-colors"
                      >
                        {/* Type */}
                        <td className="px-4 py-3">
                          <Badge className={`${typeConfig.bgColor} ${typeConfig.color}`}>
                            {item.type === "assessment" ? (
                              <ClipboardCheck className="w-3 h-3 mr-1" />
                            ) : (
                              <FileText className="w-3 h-3 mr-1" />
                            )}
                            {typeConfig.label}
                          </Badge>
                        </td>

                        {/* Template */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{item.templateName}</span>
                        </td>

                        {/* Client */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <Link
                              href={`/clients/${item.clientId}`}
                              className="text-sm hover:text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.clientName}
                            </Link>
                          </div>
                        </td>

                        {/* Submitted By */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground-secondary">{item.submitterName}</span>
                        </td>

                        {/* Submitted Date */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground-secondary">
                            {new Date(item.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-foreground-tertiary block">
                            {new Date(item.submittedAt).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge className={`${statusConfig.bgColor} ${statusConfig.color} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </Badge>
                        </td>

                        {/* Reviewer */}
                        <td className="px-4 py-3">
                          {item.qaReviewerName ? (
                            <div>
                              <span className="text-sm">{item.qaReviewerName}</span>
                              {item.qaReviewedAt && (
                                <span className="text-xs text-foreground-tertiary block">
                                  {new Date(item.qaReviewedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-foreground-tertiary">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isPending ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => openReviewModal(item, "approve")}
                                  className="h-7 px-2"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => openReviewModal(item, "reject")}
                                  className="h-7 px-2"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <Link
                                href={
                                  item.type === "assessment"
                                    ? `/assessments/${item.id}`
                                    : `/visit-notes/${item.id}`
                                }
                              >
                                <Button size="sm" variant="secondary" className="h-7 px-2">
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  View
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {reviewModal.open && reviewModal.item && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    reviewModal.action === "approve" ? "bg-success/20" : "bg-error/20"
                  }`}
                >
                  {reviewModal.action === "approve" ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-error" />
                  )}
                </div>
                <div>
                  <CardTitle>
                    {reviewModal.action === "approve" ? "Approve" : "Reject"}{" "}
                    {reviewModal.item.type === "assessment" ? "Assessment" : "Visit Note"}
                  </CardTitle>
                  <CardDescription>{reviewModal.item.templateName}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-background-secondary text-sm">
                <p>
                  <span className="font-medium">Client:</span> {reviewModal.item.clientName}
                </p>
                <p>
                  <span className="font-medium">Submitted by:</span> {reviewModal.item.submitterName}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(reviewModal.item.submittedAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Comment {reviewModal.action === "reject" && "(required)"}
                </label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={
                    reviewModal.action === "approve"
                      ? "Optional comment..."
                      : "Please provide a reason for rejection..."
                  }
                  rows={4}
                />
              </div>

              {reviewModal.action === "reject" && !reviewComment && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>A comment is recommended when rejecting</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setReviewModal({ open: false, item: null, action: null })}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant={reviewModal.action === "approve" ? "default" : "secondary"}
                  onClick={handleReview}
                  disabled={isSubmitting}
                  className={reviewModal.action === "reject" ? "bg-error hover:bg-error/90" : ""}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : reviewModal.action === "approve" ? (
                    "Approve"
                  ) : (
                    "Reject"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
