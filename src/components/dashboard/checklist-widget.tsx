"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { CollapsibleWidget } from "./collapsible-widget";
import { ChecklistContent } from "@/components/checklists/checklist-content";
import { ChecklistResponse, checklistRequest } from "@/lib/checklists/types";

export function ChecklistWidget() {
  const [data, setData] = useState<ChecklistResponse | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    const result = await checklistRequest<ChecklistResponse>(
      "/api/checklists?widget=true",
    );
    setData(result);
    setError("");
  }, []);
  useEffect(() => {
    const load = () => {
      refresh().catch((e) => setError(e.message));
    };
    load();
    const timer = setInterval(load, 30000);
    window.addEventListener("focus", load);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", load);
    };
  }, [refresh]);
  if (data?.visible === false) return null;
  return (
    <CollapsibleWidget
      id="checklists"
      title={data?.checklist?.title || "My checklist"}
      icon={<ListChecks className="h-5 w-5" />}
      headerActions={
        <Link className="text-sm text-primary" href="/checklists">
          View all
        </Link>
      }
      contentClassName="p-4"
    >
      {error && (
        <p role="alert" className="mb-3 text-sm text-error">
          {error}
        </p>
      )}
      {!data && !error && <p className="text-sm">Loading checklist…</p>}
      {data && !data.checklist && (
        <p className="text-sm text-foreground-secondary">
          You have no unfinished checklists.
        </p>
      )}
      {data?.checklist && (
        <div className="space-y-3">
          <p className="text-sm text-foreground-secondary">
            Select an item to see its comments and attachments.
          </p>
          <ChecklistContent
            key={data.checklist.id}
            checklist={data.checklist}
            isAdmin={data.isAdmin}
            refresh={refresh}
            compact
          />
        </div>
      )}
    </CollapsibleWidget>
  );
}
