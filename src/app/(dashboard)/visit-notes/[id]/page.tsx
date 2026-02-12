"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Label,
  Textarea,
  Breadcrumb,
} from "@/components/ui";
import {
  VisitNoteDetail,
  FormSchemaSnapshot,
  FieldValue,
  FIELD_TYPE_LABELS,
  ThresholdBreachData,
  VisitNoteDetailWithBreaches,
} from "@/lib/visit-notes/types";
import { ThresholdAlertBanner } from "@/components/visit-notes/threshold-alert-banner";
import { FormFieldType, UserRole } from "@prisma/client";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
} from "lucide-react";
import { Rating } from "@/components/ui";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  mentions: Array<{
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
    seenAt: string | null;
  }>;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export default function ViewVisitNotePage() {
  const params = useParams();
  const { data: session } = useSession();
  const noteId = params.id as string;

  const [visitNote, setVisitNote] = React.useState<VisitNoteDetailWithBreaches | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [staffMembers, setStaffMembers] = React.useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Comment form state
  const [newComment, setNewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState("");

  // Mention picker state
  const [showMentionPicker, setShowMentionPicker] = React.useState(false);
  const [mentionSearch, setMentionSearch] = React.useState("");
  const [mentionPosition, setMentionPosition] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // QA Review state
  const [qaComment, setQaComment] = React.useState("");
  const [isQaSubmitting, setIsQaSubmitting] = React.useState(false);
  const [showQaModal, setShowQaModal] = React.useState<"approve" | "reject" | null>(null);

  // Check if user can review QA
  const canReviewQA = session?.user?.role && ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR"].includes(session.user.role);

  // Check if user is the carer who owns the note
  const isOwner = session?.user?.id === visitNote?.carer?.id;
  const canResubmit = isOwner && visitNote?.qaStatus === "REJECTED";

  React.useEffect(() => {
    fetchVisitNote();
    fetchComments();
    fetchStaffMembers();
  }, [noteId]);

  const fetchVisitNote = async () => {
    try {
      const response = await fetch(`/api/visit-notes/${noteId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch visit note");
      }

      setVisitNote(data.visitNote);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load visit note");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/visit-notes/${noteId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch {
      // Ignore errors for comments
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch("/api/users/mentionable");
      if (response.ok) {
        const data = await response.json();
        setStaffMembers(data.users);
      }
    } catch {
      // Ignore errors
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setNewComment(value);

    // Check if we should show mention picker
    const textBeforeCursor = value.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atIndex + 1);
      // Only show picker if there's no space after @
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionSearch(textAfterAt.toLowerCase());
        setMentionPosition(atIndex);
        setShowMentionPicker(true);
        return;
      }
    }
    setShowMentionPicker(false);
  };

  const insertMention = (staff: StaffMember) => {
    const beforeMention = newComment.substring(0, mentionPosition);
    const afterMention = newComment.substring(
      mentionPosition + mentionSearch.length + 1
    );
    const mentionText = `@[${staff.firstName} ${staff.lastName}](${staff.id}) `;
    setNewComment(beforeMention + mentionText + afterMention);
    setShowMentionPicker(false);
    textareaRef.current?.focus();
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/visit-notes/${noteId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add comment");
      }

      setNewComment("");
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/visit-notes/${noteId}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update comment");
      }

      setEditingCommentId(null);
      setEditContent("");
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(
        `/api/visit-notes/${noteId}/comments/${commentId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete comment");
      }

      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleQaReview = async (status: "APPROVED" | "REJECTED") => {
    setIsQaSubmitting(true);
    try {
      const response = await fetch(`/api/qa/visit-notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          comment: qaComment || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setShowQaModal(null);
      setQaComment("");
      await fetchVisitNote();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsQaSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!confirm("Are you sure you want to resubmit this visit note for review?")) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/visit-notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resubmit: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to resubmit");
      }

      await fetchVisitNote();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resubmit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
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

  const formatCommentTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Render comment content with highlighted mentions
  const renderCommentContent = (content: string) => {
    const mentionPattern = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionPattern.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      // Add mention as highlighted span
      parts.push(
        <span
          key={match.index}
          className="bg-primary/20 text-primary px-1 rounded font-medium"
        >
          @{match[1]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  const filteredStaff = staffMembers.filter(
    (staff) =>
      `${staff.firstName} ${staff.lastName}`
        .toLowerCase()
        .includes(mentionSearch) && staff.id !== session?.user?.id
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
      </div>
    );
  }

  if (error || !visitNote) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Visit Notes", href: "/visit-notes" },
            { label: "Not Found" },
          ]}
        />
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-error">{error || "Visit note not found"}</p>
          <Link href="/visit-notes" className="mt-4">
            <Button variant="ghost">Back to Visit Notes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const schema = visitNote.formSchemaSnapshot;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Visit Notes", href: "/visit-notes" },
          { label: `${visitNote.client.firstName} ${visitNote.client.lastName}`, href: `/clients/${visitNote.client.id}` },
          { label: schema.templateName },
        ]}
      />

      {/* Header */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{schema.templateName}</h1>
          <Badge variant="default">v{schema.version}</Badge>
        </div>
        <p className="text-foreground-secondary">
          Submitted {formatDate(visitNote.submittedAt)} at{" "}
          {formatTime(visitNote.submittedAt)}
        </p>
      </div>

      {/* Threshold Breach Alerts */}
      {visitNote.thresholdBreaches && visitNote.thresholdBreaches.length > 0 && (
        <ThresholdAlertBanner breaches={visitNote.thresholdBreaches} />
      )}

      {/* Metadata */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-foreground-tertiary" />
              <div>
                <p className="text-xs text-foreground-tertiary">Client</p>
                <p className="font-medium">
                  {visitNote.client.firstName} {visitNote.client.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-foreground-tertiary" />
              <div>
                <p className="text-xs text-foreground-tertiary">Shift Date</p>
                <p className="font-medium">
                  {formatDate(visitNote.shift.scheduledStart)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-foreground-tertiary" />
              <div>
                <p className="text-xs text-foreground-tertiary">Shift Time</p>
                <p className="font-medium">
                  {formatTime(visitNote.shift.scheduledStart)} -{" "}
                  {formatTime(visitNote.shift.scheduledEnd)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Data */}
      {schema.sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {section.fields
              .sort((a, b) => a.order - b.order)
              .map((field) => (
                <div key={field.id} className="space-y-1">
                  <Label className="text-foreground-secondary">
                    {field.label}
                    {field.required && <span className="text-error ml-1">*</span>}
                  </Label>
                  <FieldValueDisplay
                    type={field.type}
                    value={visitNote.data[field.id]}
                    config={field.config}
                    files={visitNote.files.filter((f) => f.fieldId === field.id)}
                  />
                </div>
              ))}
          </CardContent>
        </Card>
      ))}

      {/* Submission Info */}
      <Card>
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-foreground-tertiary" />
            <div>
              <p className="text-xs text-foreground-tertiary">Carer</p>
              <p className="font-medium">
                {visitNote.carer.firstName} {visitNote.carer.lastName}
              </p>
            </div>
          </div>
          {visitNote.submittedOnBehalf && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <Badge variant="warning">Submitted on behalf</Badge>
              <p className="text-sm text-foreground-secondary">
                by{" "}
                <span className="font-medium text-foreground">
                  {visitNote.submittedBy.firstName} {visitNote.submittedBy.lastName}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QA Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>QA Review Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {visitNote.qaStatus === "APPROVED" ? (
              <>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-success">Approved</span>
                  </div>
                  {visitNote.qaReviewedAt && visitNote.qaReviewedBy && (
                    <p className="text-sm text-foreground-secondary">
                      Approved by {visitNote.qaReviewedBy.firstName} {visitNote.qaReviewedBy.lastName} on{" "}
                      {formatDate(visitNote.qaReviewedAt)} at {formatTime(visitNote.qaReviewedAt)}
                    </p>
                  )}
                  {visitNote.qaComment && (
                    <p className="text-sm text-foreground-secondary mt-2 p-2 bg-background-secondary rounded">
                      &ldquo;{visitNote.qaComment}&rdquo;
                    </p>
                  )}
                </div>
              </>
            ) : visitNote.qaStatus === "REJECTED" ? (
              <>
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-error" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-error">Rejected</span>
                  </div>
                  {visitNote.qaReviewedAt && visitNote.qaReviewedBy && (
                    <p className="text-sm text-foreground-secondary">
                      Rejected by {visitNote.qaReviewedBy.firstName} {visitNote.qaReviewedBy.lastName} on{" "}
                      {formatDate(visitNote.qaReviewedAt)} at {formatTime(visitNote.qaReviewedAt)}
                    </p>
                  )}
                  {visitNote.qaComment && (
                    <p className="text-sm text-foreground-secondary mt-2 p-2 bg-error/5 border border-error/20 rounded">
                      &ldquo;{visitNote.qaComment}&rdquo;
                    </p>
                  )}
                  {/* Carer can resubmit rejected notes */}
                  {canResubmit && (
                    <div className="mt-4">
                      <Button
                        onClick={handleResubmit}
                        disabled={isSubmitting}
                        variant="default"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Resubmitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Resubmit for Review
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-foreground-tertiary mt-2">
                        Click to resubmit this visit note for QA review
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : visitNote.qaStatus === "NEEDS_REVISION" ? (
              <>
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-warning">Needs Revision</span>
                  </div>
                  {visitNote.qaReviewedAt && visitNote.qaReviewedBy && (
                    <p className="text-sm text-foreground-secondary">
                      Reviewed by {visitNote.qaReviewedBy.firstName} {visitNote.qaReviewedBy.lastName} on{" "}
                      {formatDate(visitNote.qaReviewedAt)} at {formatTime(visitNote.qaReviewedAt)}
                    </p>
                  )}
                  {visitNote.qaComment && (
                    <p className="text-sm text-foreground-secondary mt-2 p-2 bg-warning/5 border border-warning/20 rounded">
                      &ldquo;{visitNote.qaComment}&rdquo;
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock3 className="h-6 w-6 text-foreground-tertiary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground-secondary">Pending Review</span>
                  </div>
                  <p className="text-sm text-foreground-tertiary">
                    This note is awaiting QA review
                  </p>
                </div>
              </>
            )}
          </div>

          {/* QA Review Actions */}
          {canReviewQA && visitNote.qaStatus === "PENDING_REVIEW" && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-foreground-secondary mb-3">Review this visit note:</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowQaModal("approve")}
                  className="bg-success hover:bg-success/90"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowQaModal("reject")}
                  className="border-error text-error hover:bg-error/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          {/* Allow reviewer to change decision on rejected notes */}
          {canReviewQA && visitNote.qaStatus === "REJECTED" && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-foreground-secondary mb-3">Change your decision:</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowQaModal("approve")}
                  className="bg-success hover:bg-success/90"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Instead
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QA Review Modal */}
      {showQaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    showQaModal === "approve" ? "bg-success/20" : "bg-error/20"
                  }`}
                >
                  {showQaModal === "approve" ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-error" />
                  )}
                </div>
                <div>
                  <CardTitle>
                    {showQaModal === "approve" ? "Approve" : "Reject"} Visit Note
                  </CardTitle>
                  <CardDescription>{schema.templateName}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-background-secondary text-sm">
                <p>
                  <span className="font-medium">Client:</span>{" "}
                  {visitNote.client.firstName} {visitNote.client.lastName}
                </p>
                <p>
                  <span className="font-medium">Submitted by:</span>{" "}
                  {visitNote.carer.firstName} {visitNote.carer.lastName}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(visitNote.submittedAt)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Comment {showQaModal === "reject" && "(recommended)"}
                </Label>
                <Textarea
                  value={qaComment}
                  onChange={(e) => setQaComment(e.target.value)}
                  placeholder={
                    showQaModal === "approve"
                      ? "Optional comment..."
                      : "Please provide a reason for rejection..."
                  }
                  rows={4}
                />
              </div>

              {showQaModal === "reject" && !qaComment && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>A comment is recommended when rejecting</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowQaModal(null);
                    setQaComment("");
                  }}
                  disabled={isQaSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleQaReview(showQaModal === "approve" ? "APPROVED" : "REJECTED")}
                  disabled={isQaSubmitting}
                  className={showQaModal === "approve" ? "bg-success hover:bg-success/90" : "bg-error hover:bg-error/90"}
                >
                  {isQaSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : showQaModal === "approve" ? (
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

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
            {comments.length > 0 && (
              <span className="text-sm font-normal text-foreground-secondary">
                ({comments.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Comments */}
          {comments.length === 0 ? (
            <p className="text-center text-foreground-tertiary py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 rounded-lg bg-background-secondary"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {comment.author.firstName[0]}
                      {comment.author.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <span className="text-xs text-foreground-tertiary">
                        {formatCommentTime(comment.createdAt)}
                      </span>
                      {comment.createdAt !== comment.updatedAt && (
                        <span className="text-xs text-foreground-tertiary">
                          (edited)
                        </span>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditComment(comment.id)}
                            disabled={isSubmitting}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditing}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">
                        {renderCommentContent(comment.content)}
                      </p>
                    )}
                  </div>
                  {session?.user?.id === comment.author.id &&
                    editingCommentId !== comment.id && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(comment)}
                          className="p-1 text-foreground-tertiary hover:text-foreground rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-foreground-tertiary hover:text-error rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="relative">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-primary">
                  {session?.user?.firstName?.[0] || "?"}
                  {session?.user?.lastName?.[0] || "?"}
                </span>
              </div>
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={handleCommentChange}
                  placeholder="Add a comment... Use @ to mention someone"
                  rows={2}
                  className="pr-12"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send className="w-4 h-4" />
                </Button>

                {/* Mention Picker */}
                {showMentionPicker && filteredStaff.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-1 w-64 max-h-48 overflow-y-auto bg-background border border-border rounded-lg shadow-lg z-10">
                    {filteredStaff.slice(0, 5).map((staff) => (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => insertMention(staff)}
                        className="w-full px-3 py-2 text-left hover:bg-background-secondary flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-primary">
                            {staff.firstName[0]}
                            {staff.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {staff.firstName} {staff.lastName}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Component to display field values based on type
function FieldValueDisplay({
  type,
  value,
  config,
  files,
}: {
  type: FormFieldType;
  value: FieldValue;
  config: unknown;
  files: Array<{ fileUrl: string; fileName: string }>;
}) {
  if (value === null || value === undefined || value === "") {
    return <p className="text-foreground-tertiary italic">No response</p>;
  }

  switch (type) {
    case "TEXT_SHORT":
    case "TEXT_LONG":
      return <p className="whitespace-pre-wrap">{value as string}</p>;

    case "NUMBER":
      return <p className="font-mono">{value as number}</p>;

    case "YES_NO":
      return (
        <Badge variant={value ? "success" : "error"}>
          {value ? "Yes" : "No"}
        </Badge>
      );

    case "SINGLE_CHOICE":
      return <Badge variant="primary">{value as string}</Badge>;

    case "MULTIPLE_CHOICE":
      return (
        <div className="flex flex-wrap gap-2">
          {(value as string[]).map((v) => (
            <Badge key={v} variant="primary">
              {v}
            </Badge>
          ))}
        </div>
      );

    case "DATE":
      return (
        <p>
          {new Date(value as string).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      );

    case "TIME":
      return <p>{value as string}</p>;

    case "DATETIME":
      return (
        <p>
          {new Date(value as string).toLocaleString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      );

    case "RATING_SCALE": {
      const ratingConfig = config as { min: number; max: number } | null;
      return (
        <Rating
          value={value as number}
          min={ratingConfig?.min || 1}
          max={ratingConfig?.max || 5}
          disabled
        />
      );
    }

    case "SIGNATURE":
    case "PHOTO": {
      const file = files[0];
      if (!file) {
        const fileValue = value as { fileUrl?: string } | null;
        if (fileValue?.fileUrl) {
          return (
            <img
              src={fileValue.fileUrl}
              alt={type === "SIGNATURE" ? "Signature" : "Photo"}
              className="max-w-sm rounded-lg border border-border"
            />
          );
        }
        return <p className="text-foreground-tertiary italic">No file</p>;
      }
      return (
        <img
          src={file.fileUrl}
          alt={file.fileName}
          className="max-w-sm rounded-lg border border-border"
        />
      );
    }

    default:
      return <p>{JSON.stringify(value)}</p>;
  }
}
