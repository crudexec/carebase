"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Circle,
  Paperclip,
  MessageSquare,
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

function ChecklistItem({
  item,
  isAdmin,
  refresh,
}: {
  item: ChecklistItemData;
  isAdmin: boolean;
  refresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [optimisticStatus, setOptimisticStatus] = useState<ItemStatus | null>(
    null,
  );
  const visibleStatus = optimisticStatus ?? item.status;
  async function mutate(
    path: string,
    init: RequestInit,
    done?: () => void,
    nextStatus?: ItemStatus,
  ) {
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
  return (
    <div
      className={`rounded-lg border p-4 space-y-3 ${visibleStatus === "APPROVED" ? "border-green-200 bg-green-50/40" : visibleStatus === "SUBMITTED" ? "border-amber-200 bg-amber-50/40" : "border-border"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <label className="flex min-w-0 flex-1 items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className={`mt-1 h-4 w-4 shrink-0 ${visibleStatus === "APPROVED" ? "accent-green-600" : "accent-amber-600"}`}
            checked={visibleStatus !== "PENDING"}
            disabled={busy || visibleStatus === "APPROVED"}
            onChange={() =>
              action(visibleStatus === "PENDING" ? "submit" : "uncheck")
            }
          />
          <span className="text-sm font-medium break-words min-w-0">
            {item.title}
          </span>
        </label>
        <ItemStatusBadge status={visibleStatus} />
      </div>
      {item.approvedBy && (
        <p className="text-xs text-foreground-secondary">
          Approved by {item.approvedBy.firstName} {item.approvedBy.lastName}
          {item.approvedAt &&
            ` · ${new Date(item.approvedAt).toLocaleString()}`}
        </p>
      )}
      {item.status === "SUBMITTED" && item.submittedBy && (
        <p className="text-xs text-foreground-secondary">
          Checked off by {item.submittedBy.firstName}{" "}
          {item.submittedBy.lastName}
        </p>
      )}
      {isAdmin && (
        <div className="flex flex-wrap gap-2">
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
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      <details className="text-sm">
        <summary className="cursor-pointer text-foreground-secondary flex flex-wrap items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {item.comments.length} comments <Paperclip className="h-4 w-4 ml-2" />
          {item.attachments.length} attachments{" "}
          <span className="text-primary">· View / add</span>
        </summary>
        <div className="mt-4 space-y-4">
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
              rows={2}
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
                    className="text-primary underline break-all"
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
            <label htmlFor={`file-${item.id}`} className="block font-medium">
              Attach a file
            </label>
            <input
              id={`file-${item.id}`}
              type="file"
              className="block w-full min-w-0 text-sm"
              disabled={busy}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.txt,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                const input = e.target;
                if (!file) return;
                if (file.size > 10 * 1024 * 1024) {
                  setError("Maximum file size is 10 MB");
                  input.value = "";
                  return;
                }
                const body = new FormData();
                body.append("file", file);
                void mutate(
                  `/api/checklists/items/${item.id}/attachments`,
                  { method: "POST", body },
                  () => {
                    input.value = "";
                  },
                );
              }}
            />
            <p className="text-xs text-foreground-secondary">
              PDF, images, Word, Excel, text, or CSV. Up to 10 MB per file.
            </p>
          </div>
        </div>
      </details>
      {busy && (
        <p role="status" className="text-xs text-foreground-secondary">
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
      {checklist.description && (
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
      <div
        className={
          compact ? "max-h-[32rem] overflow-y-auto space-y-3 pr-1" : "space-y-3"
        }
      >
        {checklist.items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            isAdmin={isAdmin}
            refresh={refresh}
          />
        ))}
      </div>
    </div>
  );
}
