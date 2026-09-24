"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Person,
  TemplateData,
  checklistRequest,
  jsonRequest,
} from "@/lib/checklists/types";

type AssignableUser = Person & { email: string; role: string };
const emptyDraft = () => ({ title: "", description: "", items: [""] });
export default function ChecklistTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editing, setEditing] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const result = await checklistRequest<{
      templates: TemplateData[];
      users: AssignableUser[];
    }>("/api/checklists/templates");
    setTemplates(result.templates);
    setUsers(result.users);
    setCanManage(true);
  }, []);
  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);
  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save changes");
    } finally {
      setBusy(false);
    }
  }
  function move(index: number, offset: number) {
    const items = [...draft.items];
    [items[index], items[index + offset]] = [
      items[index + offset],
      items[index],
    ];
    setDraft({ ...draft, items });
  }
  const selectedTemplate = templates.find(
    (t) => t.id === templateId && !t.archived,
  );
  const matchingUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-6 max-w-6xl">
      <Link href="/checklists" className="text-sm text-primary">
        ← All checklists
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">Checklist templates</h1>
        <p className="text-sm text-foreground-secondary">
          Create once, then assign individual copies to your users.
        </p>
      </div>
      {error && (
        <p role="alert" className="text-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-green-700">
          {message}
        </p>
      )}
      {loading ? (
        <p>Loading templates…</p>
      ) : !canManage ? null : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editing ? "Edit template" : "New template"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void run(async () => {
                      await checklistRequest(
                        "/api/checklists/templates",
                        jsonRequest(editing ? "PATCH" : "POST", {
                          ...draft,
                          ...(editing ? { id: editing } : {}),
                        }),
                      );
                      setEditing(null);
                      setDraft(emptyDraft());
                      await load();
                      setMessage(
                        "Template saved. Existing assignments are unchanged.",
                      );
                    });
                  }}
                >
                  <fieldset disabled={busy} className="space-y-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="template-title"
                        className="text-sm font-medium"
                      >
                        Title
                      </label>
                      <Input
                        id="template-title"
                        required
                        maxLength={200}
                        value={draft.title}
                        onChange={(e) =>
                          setDraft({ ...draft, title: e.target.value })
                        }
                        placeholder="New staff onboarding"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="template-description"
                        className="text-sm font-medium"
                      >
                        Description (optional)
                      </label>
                      <textarea
                        id="template-description"
                        rows={2}
                        maxLength={5000}
                        className="w-full rounded-md border border-border p-2 text-sm"
                        value={draft.description}
                        onChange={(e) =>
                          setDraft({ ...draft, description: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Checklist items</p>
                      {draft.items.map((item, index) => (
                        <div className="flex items-center gap-1" key={index}>
                          <span className="text-xs text-foreground-secondary w-5 shrink-0">
                            {index + 1}.
                          </span>
                          <Input
                            aria-label={`Item ${index + 1}`}
                            required
                            maxLength={500}
                            value={item}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                items: draft.items.map((v, i) =>
                                  i === index ? e.target.value : v,
                                ),
                              })
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Move item ${index + 1} up`}
                            disabled={index === 0}
                            onClick={() => move(index, -1)}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Move item ${index + 1} down`}
                            disabled={index === draft.items.length - 1}
                            onClick={() => move(index, 1)}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove item ${index + 1}`}
                            disabled={draft.items.length === 1}
                            onClick={() =>
                              setDraft({
                                ...draft,
                                items: draft.items.filter(
                                  (_, i) => i !== index,
                                ),
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={draft.items.length >= 100}
                      onClick={() =>
                        setDraft({ ...draft, items: [...draft.items, ""] })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add item
                    </Button>
                    <div className="flex gap-2">
                      <Button type="submit">
                        {busy ? "Saving…" : "Save template"}
                      </Button>
                      {editing && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setEditing(null);
                            setDraft(emptyDraft());
                          }}
                        >
                          Cancel edit
                        </Button>
                      )}
                    </div>
                  </fieldset>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Assign a checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void run(async () => {
                      const result = await checklistRequest<{
                        checklists: { id: string }[];
                      }>(
                        "/api/checklists",
                        jsonRequest("POST", { templateId, assigneeIds }),
                      );
                      setAssigneeIds([]);
                      setMessage(
                        `Checklist assigned to ${result.checklists.length} ${result.checklists.length === 1 ? "user" : "users"}. Each has their own copy.`,
                      );
                    });
                  }}
                >
                  <fieldset disabled={busy} className="space-y-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="assign-template"
                        className="text-sm font-medium"
                      >
                        Template
                      </label>
                      <select
                        id="assign-template"
                        className="w-full rounded-md border border-border p-2 text-sm"
                        required
                        value={templateId}
                        onChange={(e) => setTemplateId(e.target.value)}
                      >
                        <option value="">Select a template</option>
                        {templates
                          .filter((t) => !t.archived)
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title}
                            </option>
                          ))}
                      </select>
                    </div>
                    {selectedTemplate && (
                      <p className="text-sm text-foreground-secondary">
                        {selectedTemplate.items.length} items · Each user
                        completes their own copy.
                      </p>
                    )}
                    <div className="space-y-2">
                      <label
                        htmlFor="user-search"
                        className="text-sm font-medium"
                      >
                        Assign to users ({assigneeIds.length} selected)
                      </label>
                      <Input
                        id="user-search"
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <div className="max-h-64 overflow-y-auto border border-border rounded-md divide-y divide-border">
                        {matchingUsers.map((u) => (
                          <label
                            key={u.id}
                            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-background-secondary"
                          >
                            <input
                              type="checkbox"
                              checked={assigneeIds.includes(u.id)}
                              onChange={(e) =>
                                setAssigneeIds(
                                  e.target.checked
                                    ? [...assigneeIds, u.id]
                                    : assigneeIds.filter((id) => id !== u.id),
                                )
                              }
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-medium">
                                {u.firstName} {u.lastName}
                              </span>
                              <span className="block text-xs text-foreground-secondary break-all">
                                {u.email} ·{" "}
                                {u.role.toLowerCase().replaceAll("_", " ")}
                              </span>
                            </span>
                          </label>
                        ))}
                        {!matchingUsers.length && (
                          <p className="p-3 text-sm text-foreground-secondary">
                            No matching users.
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={!selectedTemplate || !assigneeIds.length}
                    >
                      {busy ? "Saving…" : "Assign checklist"}
                    </Button>
                  </fieldset>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Saved templates</h2>
            {!templates.length && (
              <p className="text-sm text-foreground-secondary">
                Your saved templates will appear here.
              </p>
            )}
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-4"
              >
                <div className="min-w-0">
                  <h3 className="font-medium break-words">
                    {t.title}
                    {t.archived && (
                      <span className="ml-2 text-xs text-foreground-secondary">
                        Archived
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    {t.items.length} items
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!t.archived && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => {
                        setTemplateId(t.id);
                        document.getElementById("assign-template")?.focus();
                      }}
                    >
                      Assign
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      setEditing(t.id);
                      setDraft({
                        title: t.title,
                        description: t.description,
                        items: [...t.items],
                      });
                      document.getElementById("template-title")?.focus();
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await checklistRequest(
                          "/api/checklists/templates",
                          jsonRequest("PATCH", {
                            id: t.id,
                            archived: !t.archived,
                          }),
                        );
                        if (templateId === t.id) setTemplateId("");
                        await load();
                        setMessage(
                          t.archived
                            ? "Template restored."
                            : "Template archived. Existing assignments remain available.",
                        );
                      })
                    }
                  >
                    {t.archived ? "Restore" : "Archive"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
