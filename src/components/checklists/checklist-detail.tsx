"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChecklistContent } from "./checklist-content";
import { ChecklistResponse, checklistRequest } from "@/lib/checklists/types";
import { Button } from "@/components/ui/button";

export function ChecklistDetail({ id }: { id: string }) {
  const [data, setData] = useState<ChecklistResponse | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    const result = await checklistRequest<ChecklistResponse>(
      `/api/checklists/${id}`,
    );
    setData(result);
    setError("");
  }, [id]);
  useEffect(() => {
    let cancelled = false;
    checklistRequest<ChecklistResponse>(`/api/checklists/${id}`)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/checklists" className="text-primary text-sm">
        ← All checklists
      </Link>
      {error && (
        <div role="alert" className="text-error">
          {error}{" "}
          <Button
            variant="secondary"
            onClick={() => refresh().catch((e) => setError(e.message))}
          >
            Retry
          </Button>
        </div>
      )}
      {!data && !error && <p>Loading checklist…</p>}
      {data?.checklist && (
        <>
          <div>
            <h1 className="text-2xl font-semibold">{data.checklist.title}</h1>
            <p className="text-sm text-foreground-secondary">
              Assigned to {data.checklist.assignee.firstName}{" "}
              {data.checklist.assignee.lastName} ·{" "}
              {new Date(data.checklist.createdAt).toLocaleDateString()}
            </p>
          </div>
          <ChecklistContent
            checklist={data.checklist}
            isAdmin={data.isAdmin}
            refresh={refresh}
          />
        </>
      )}
    </div>
  );
}
