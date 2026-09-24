"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChecklistData, checklistRequest } from "@/lib/checklists/types";

type Summary = Pick<
  ChecklistData,
  "id" | "title" | "description" | "createdAt" | "assignee"
> & { items: { id: string; status: string }[] };
export default function ChecklistsPage() {
  const [data, setData] = useState<{
    checklists: Summary[];
    isAdmin: boolean;
  } | null>(null);
  const [filter, setFilter] = useState("active");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await checklistRequest("/api/checklists"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load checklists");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const checklists =
    data?.checklists.filter((c) => {
      const complete =
        c.items.length > 0 && c.items.every((i) => i.status === "APPROVED");
      return filter === "completed"
        ? complete
        : filter === "review"
          ? c.items.some((i) => i.status === "SUBMITTED")
          : !complete;
    }) || [];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Checklists</h1>
          <p className="text-sm text-foreground-secondary">
            {data?.isAdmin
              ? "Manage assignments and review completed items."
              : "Complete your assigned items and send them for approval."}
          </p>
        </div>
        {data?.isAdmin && (
          <Button asChild>
            <Link href="/checklists/templates">Templates & assignments</Link>
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Filter checklists">
        {[
          ["active", "Active"],
          ...(data?.isAdmin ? [["review", "Awaiting approval"]] : []),
          ["completed", "Completed"],
        ].map(([value, label]) => (
          <Button
            key={value}
            variant={filter === value ? "default" : "secondary"}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
        <Button variant="ghost" disabled={loading} onClick={load}>
          Refresh
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-error">
          {error}
        </p>
      )}
      {loading && <p>Loading checklists…</p>}
      {!loading && !error && !checklists.length && (
        <Card>
          <CardContent className="py-10 text-center text-foreground-secondary">
            {filter === "completed"
              ? "No completed checklists yet."
              : filter === "review"
                ? "No items are awaiting approval."
                : "No active checklists."}
            {data?.isAdmin && filter === "active" && (
              <p className="mt-2">
                <Link href="/checklists/templates" className="text-primary">
                  Create a template and assign your first checklist
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {checklists.map((c) => {
          const approved = c.items.filter(
            (i) => i.status === "APPROVED",
          ).length;
          const submitted = c.items.filter(
            (i) => i.status === "SUBMITTED",
          ).length;
          return (
            <Link
              key={c.id}
              href={`/checklists/${c.id}`}
              className="rounded-lg border border-border bg-white p-5 space-y-3 hover:border-primary transition-colors"
            >
              <h2 className="font-semibold break-words">{c.title}</h2>
              <p className="text-sm text-foreground-secondary">
                {c.assignee.firstName} {c.assignee.lastName} · Assigned{" "}
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm">
                {approved} of {c.items.length} approved
              </p>
              <progress
                className="w-full h-2 accent-green-600"
                aria-label="Approved checklist items"
                value={approved}
                max={c.items.length || 1}
              />
              {submitted > 0 && (
                <p className="text-xs text-amber-800">
                  {submitted} awaiting approval
                </p>
              )}
              {approved === c.items.length && (
                <p className="text-xs text-green-700">Completed</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
