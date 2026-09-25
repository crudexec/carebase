"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Circle,
  Paperclip,
  MessageSquare,
  UploadCloud,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChecklistData,
  ChecklistItemData,
  ItemStatus,
  checklistRequest,
  jsonRequest,
} from "@/lib/checklists/types";

const statusStyles = {
  PENDING: {
    label: "Not completed",
    color: "bg-background-secondary text-foreground-secondary",
    icon: Circle,
  },
  SUBMITTED: {
    label: "Awaiting approval",
    color: "bg-amber-100 text-amber-900",
    icon: Clock3,
  },
  APPROVED: {
    label: "Approved",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
};
export function ItemStatusBadge({ status }: { status: ItemStatus }) {
  const { label, color, icon: Icon } = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

type ItemMutation = (
  path: string,
  init: RequestInit,
  done?: () => void,
  nextStatus?: ItemStatus,
) => Promise<void>;

function ItemDetails({
  item,
  busy,
  error,
  setError,
  comment,
  setComment,
  mutate,
}: {
  item: ChecklistItemData;
  busy: boolean;
  error: string;
  setError: (value: string) => void;
  comment: string;
  setComment: (value: string) => void;
  mutate: ItemMutation;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachFile = (file?: File, input?: HTMLInputElement) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Maximum file size is 10 MB");
      if (input) input.value = "";
      return;
    }
    const body = new FormData();
    body.append("file", file);
    setUploadingFile(file.name);
    void mutate(
      `/api/checklists/items/${item.id}/attachments`,
      { method: "POST", body },
      () => {
        if (input) input.value = "";
      },
    ).finally(() => setUploadingFile(""));
  };

  return (
    <div className="space-y-4 text-sm">
      {error && (
        <p role="alert" className="text-error">
          {error}
        </p>
      )}
      {item.comments.map((c) => (
        <div key={c.id} className="rounded-md bg-background-secondary p-3">
          <p className="text-xs text-foreground-secondary">
            {c.author.firstName} {c.author.lastName} ·{" "}
            {new Date(c.createdAt).toLocaleString()}
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words">{c.body}</p>
        </div>
      ))}
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          void mutate(
            `/api/checklists/items/${item.id}/comments`,
            jsonRequest("POST", { body: comment }),
            () => setComment(""),
          );
        }}
      >
        <label htmlFor={`comment-${item.id}`} className="block font-medium">
          Add a comment
        </label>
        <textarea
          id={`comment-${item.id}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={5000}
          required
          rows={3}
          disabled={busy}
          className="w-full rounded-md border border-border bg-white p-2"
        />
        <Button type="submit" size="sm" disabled={busy || !comment.trim()}>
          Post comment
        </Button>
      </form>
      {item.attachments.length > 0 && (
        <ul className="space-y-2">
          {item.attachments.map((a) => (
            <li key={a.id}>
              <a
                className="break-all text-primary underline"
                href={`/api/checklists/attachments/${a.id}`}
              >
                {a.fileName}
              </a>
              <p className="text-xs text-foreground-secondary">
                {a.author.firstName} {a.author.lastName} ·{" "}
                {(a.size / 1024).toFixed(1)} KB
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-1">
        <p className="mb-2 font-medium">Attach a file</p>
        <label
          htmlFor={`file-${item.id}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            attachFile(event.dataTransfer.files?.[0]);
          }}
          role="button"
          tabIndex={busy ? -1 : 0}
          aria-disabled={busy}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isDragging ? "border-primary bg-primary/5" : "border-gray-300 bg-gray-50 hover:border-primary hover:bg-blue-50/60"} ${busy ? "cursor-wait opacity-60" : ""}`}
        >
          {uploadingFile ? (
            <>
              <FileText className="mb-2 h-6 w-6 text-primary" />
              <span className="max-w-full truncate text-sm font-medium text-foreground">
                Uploading {uploadingFile}…
              </span>
            </>
          ) : (
            <>
              <UploadCloud className={`mb-2 h-7 w-7 ${isDragging ? "text-primary" : "text-foreground-secondary"}`} />
              <span className="text-sm font-medium text-foreground">
                Drop a file here or <span className="text-primary underline underline-offset-2">browse files</span>
              </span>
              <span className="mt-1 text-xs text-foreground-secondary">
                PDF, images, Word, Excel, text, or CSV · Up to 10 MB
              </span>
            </>
          )}
        </label>
        <input
          ref={fileInputRef}
          id={`file-${item.id}`}
          type="file"
          className="sr-only"
          aria-label="Choose a file to attach"
          disabled={busy}
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.txt,.csv"
          onChange={(e) => {
            attachFile(e.target.files?.[0], e.target);
          }}
        />
      </div>
    </div>
  );
}

function ChecklistItem({
  item,
  isAdmin,
  refresh,
  compact = false,
  rowIndex = 0,
}: {
  item: ChecklistItemData;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  compact?: boolean;
  rowIndex?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [optimisticStatus, setOptimisticStatus] = useState<ItemStatus | null>(
    null,
  );
  const [showItemModal, setShowItemModal] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const visibleStatus = optimisticStatus ?? item.status;
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (showItemModal && !dialog.open) dialog.showModal();
    if (!showItemModal && dialog.open) dialog.close();
  }, [showItemModal]);
  async function mutate(
    path: string,
    init: RequestInit,
    done?: () => void,
    nextStatus?: ItemStatus,
  ): Promise<void> {
    if (nextStatus) setOptimisticStatus(nextStatus);
    setBusy(true);
    setError("");
    try {
      await checklistRequest(path, init);
      done?.();
      await refresh();
      if (nextStatus) setOptimisticStatus(null);
    } catch (e) {
      if (nextStatus) setOptimisticStatus(null);
      setError(e instanceof Error ? e.message : "Unable to save changes");
    } finally {
      setBusy(false);
    }
  }
  const action = (value: string) => {
    const nextStatus =
      value === "submit"
        ? "SUBMITTED"
        : value === "approve"
          ? "APPROVED"
          : "PENDING";
    void mutate(
      `/api/checklists/items/${item.id}`,
      jsonRequest("PATCH", { action: value }),
      undefined,
      nextStatus,
    );
  };
  const itemDetails = (
    <ItemDetails
      item={item}
      busy={busy}
      error={error}
      setError={setError}
      comment={comment}
      setComment={setComment}
      mutate={mutate}
    />
  );
  return (
    <div
      className={compact
        ? `grid grid-cols-[36px_minmax(0,1fr)_minmax(76px,auto)_minmax(92px,auto)] border-b border-gray-100 last:border-b-0 ${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50`
        : `space-y-3 rounded-lg border p-4 ${visibleStatus === "APPROVED" ? "border-green-200 bg-green-50/40" : visibleStatus === "SUBMITTED" ? "border-amber-200 bg-amber-50/40" : "border-border"}`}
    >
      {compact ? (
        <div className="col-span-full grid grid-cols-[36px_minmax(0,1fr)_minmax(76px,auto)_minmax(92px,auto)] items-center gap-x-2">
          <input
            type="checkbox"
            aria-label={`Mark ${item.title} complete`}
            className={`mx-auto h-4 w-4 shrink-0 ${visibleStatus === "APPROVED" ? "accent-green-600" : "accent-amber-600"}`}
            checked={visibleStatus !== "PENDING"}
            disabled={busy || visibleStatus === "APPROVED"}
            onChange={() =>
              action(visibleStatus === "PENDING" ? "submit" : "uncheck")
            }
          />
          <button
            type="button"
            className="min-w-0 truncate px-2 py-1.5 text-left text-xs font-medium text-gray-900 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-haspopup="dialog"
            onClick={() => setShowItemModal(true)}
            title={item.title}
          >
            {item.title}
          </button>
          <button
            type="button"
            className="flex min-w-0 items-center justify-center gap-1 px-1 py-1.5 text-[10px] text-gray-700 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-haspopup="dialog"
            onClick={() => setShowItemModal(true)}
            aria-label={`${item.comments.length} comments, ${item.attachments.length} attachments`}
            title="View comments and attachments"
          >
            <MessageSquare className="h-3 w-3 shrink-0" />{item.comments.length}
            <Paperclip className="ml-1 h-3 w-3 shrink-0" />{item.attachments.length}
          </button>
          <div className="flex justify-end pr-2"><ItemStatusBadge status={visibleStatus} /></div>
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Mark ${item.title} complete`}
              className={`mt-1 h-4 w-4 shrink-0 ${visibleStatus === "APPROVED" ? "accent-green-600" : "accent-amber-600"}`}
              checked={visibleStatus !== "PENDING"}
              disabled={busy || visibleStatus === "APPROVED"}
              onChange={() => action(visibleStatus === "PENDING" ? "submit" : "uncheck")}
            />
            <span className="min-w-0 break-words text-sm font-medium">{item.title}</span>
          </div>
          <ItemStatusBadge status={visibleStatus} />
        </div>
      )}
      {item.approvedBy && (
        <p className={`${compact ? "col-span-full px-3 pb-2" : ""} text-xs text-foreground-secondary`}>
          Approved by {item.approvedBy.firstName} {item.approvedBy.lastName}
          {item.approvedAt &&
            ` · ${new Date(item.approvedAt).toLocaleString()}`}
        </p>
      )}
      {item.status === "SUBMITTED" && item.submittedBy && (
        <p className={`${compact ? "col-span-full px-3 pb-2" : ""} text-xs text-foreground-secondary`}>
          Checked off by {item.submittedBy.firstName}{" "}
          {item.submittedBy.lastName}
        </p>
      )}
      {isAdmin && (
        <div className={`${compact ? "col-span-full px-3 pb-2" : ""} flex flex-wrap gap-2`}>
          {item.status === "SUBMITTED" && (
            <>
              <Button
                size="sm"
                variant="success"
                disabled={busy}
                onClick={() => action("approve")}
              >
                Approve item
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() => action("uncheck")}
              >
                Return for changes
              </Button>
            </>
          )}
          {item.status === "APPROVED" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => action("reopen")}
            >
              Reopen item
            </Button>
          )}
        </div>
      )}
      {!compact && error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      {!compact && (
        <details className="text-sm">
          <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-foreground-secondary">
            <MessageSquare className="h-4 w-4" />
            {item.comments.length} comments
            <Paperclip className="ml-2 h-4 w-4" />
            {item.attachments.length} attachments
            <span className="text-primary">· View / add</span>
          </summary>
          <div className="mt-4">{itemDetails}</div>
        </details>
      )}
      {compact && showItemModal && (
        <dialog
          ref={dialogRef}
          aria-labelledby={`item-dialog-title-${item.id}`}
          className="m-auto max-h-[85dvh] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-xl bg-white p-0 shadow-2xl backdrop:bg-black/50"
          onClose={() => setShowItemModal(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowItemModal(false);
            }
          }}
        >
          <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-border bg-white p-4">
            <div className="min-w-0 space-y-2">
              <h2
                id={`item-dialog-title-${item.id}`}
                className="break-words text-lg font-semibold"
              >
                {item.title}
              </h2>
              <ItemStatusBadge status={visibleStatus} />
            </div>
            <button
              type="button"
              autoFocus
              aria-label="Close item details"
              onClick={() => setShowItemModal(false)}
              className="rounded-md px-2 py-1 text-sm text-foreground-secondary hover:bg-background-secondary"
            >
              Close
            </button>
          </div>
          <div className="space-y-4 p-4">
            <h3 className="font-medium">Comments and attachments</h3>
            {isAdmin && visibleStatus === "SUBMITTED" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="success"
                  disabled={busy}
                  onClick={() => action("approve")}
                >
                  Approve item
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => action("uncheck")}
                >
                  Return for changes
                </Button>
              </div>
            )}
            {isAdmin && visibleStatus === "APPROVED" && (
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() => action("reopen")}
              >
                Reopen item
              </Button>
            )}
            {itemDetails}
          </div>
        </dialog>
      )}
      {busy && (
        <p role="status" className={`${compact ? "col-span-full px-3 pb-2" : ""} text-xs text-foreground-secondary`}>
          Saving…
        </p>
      )}
    </div>
  );
}

export function ChecklistContent({
  checklist,
  isAdmin,
  refresh,
  compact = false,
}: {
  checklist: ChecklistData;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  compact?: boolean;
}) {
  const approved = checklist.items.filter(
    (i) => i.status === "APPROVED",
  ).length;
  const submitted = checklist.items.filter(
    (i) => i.status === "SUBMITTED",
  ).length;
  return (
    <div className="space-y-4">
      {!compact && checklist.description && (
        <p className="text-sm whitespace-pre-wrap text-foreground-secondary">
          {checklist.description}
        </p>
      )}
      <div className="space-y-2">
        <p className="text-sm font-medium" aria-live="polite">
          {approved} of {checklist.items.length} approved
          {submitted > 0 && ` · ${submitted} awaiting approval`}
        </p>
        <progress
          className="w-full h-2 accent-green-600"
          aria-label="Approved checklist items"
          value={approved}
          max={checklist.items.length || 1}
        />
        {approved === checklist.items.length && (
          <p className="text-sm text-green-700">
            Checklist complete — every item is approved.
          </p>
        )}
      </div>
      {compact ? (
        <div className="overflow-hidden rounded border border-gray-200 bg-white">
          <div className="grid grid-cols-[36px_minmax(0,1fr)_minmax(76px,auto)_minmax(92px,auto)] border-b border-gray-200 bg-gray-50 text-[10px] font-semibold text-gray-600">
            <span className="px-2 py-1 text-center">Done</span>
            <span className="px-2 py-1">Checklist item</span>
            <span className="px-1 py-1 text-center">Notes</span>
            <span className="px-2 py-1 text-right">Status</span>
          </div>
          {checklist.items.map((item, index) => (
            <ChecklistItem
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              refresh={refresh}
              compact
              rowIndex={index}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {checklist.items.map((item) => (
            <ChecklistItem key={item.id} item={item} isAdmin={isAdmin} refresh={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
