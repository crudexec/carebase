"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from "@/components/ui";
import { DEFAULT_OFFER_TAGS } from "@/lib/offer-letters/rendering";
import { sanitizeOfferHtml } from "@/lib/offer-letters/html";
import { OfferLetterEditor } from "@/components/offer-letters/offer-letter-editor";
import { Archive, Copy, FileText, Plus, Save } from "lucide-react";

interface OfferLetterTemplate {
  id: string; name: string; description: string | null; subject: string; bodyHtml: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"; updatedAt: string; _count?: { offerLetters: number };
}
type TemplateFormState = { name: string; description: string; subject: string; bodyHtml: string; status: "DRAFT" | "ACTIVE" };
const EMPTY_TEMPLATE: TemplateFormState = {
  name: "", description: "", subject: "Offer Letter for {employee.firstName} {employee.lastName}",
  bodyHtml: "<p>Dear {employee.firstName},</p><p>We are pleased to extend this offer letter from {company.name}.</p><p>Please review the terms outlined in this letter and sign to acknowledge acceptance.</p><p>Sincerely,<br>{company.name}</p>", status: "DRAFT",
};

export default function OfferLetterTemplatesPage() {
  const [templates, setTemplates] = React.useState<OfferLetterTemplate[]>([]);
  const [selected, setSelected] = React.useState<OfferLetterTemplate | null>(null);
  const [form, setForm] = React.useState<TemplateFormState>(EMPTY_TEMPLATE);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [editorKey, setEditorKey] = React.useState(0);
  const savedForm = React.useRef(JSON.stringify(EMPTY_TEMPLATE));
  const isDirty = JSON.stringify(form) !== savedForm.current;

  const fetchTemplates = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/offer-letters/templates");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch templates");
      setTemplates(data.templates || []);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to fetch templates"); }
    finally { setIsLoading(false); }
  }, []);

  React.useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const canDiscard = () => !isDirty || window.confirm("Discard your unsaved changes?");
  const startNew = () => {
    if (!canDiscard()) return;
    setSelected(null); setForm(EMPTY_TEMPLATE); savedForm.current = JSON.stringify(EMPTY_TEMPLATE); setEditorKey((key) => key + 1);
  };
  const editTemplate = (template: OfferLetterTemplate) => {
    if (!canDiscard()) return;
    const next: TemplateFormState = { name: template.name, description: template.description || "", subject: template.subject, bodyHtml: template.bodyHtml, status: template.status === "ARCHIVED" ? "DRAFT" : template.status };
    setSelected(template); setForm(next); savedForm.current = JSON.stringify(next); setEditorKey((key) => key + 1);
  };
  const duplicateTemplate = (template: OfferLetterTemplate) => {
    if (!canDiscard()) return;
    const next: TemplateFormState = { name: `${template.name} (Copy)`, description: template.description || "", subject: template.subject, bodyHtml: template.bodyHtml, status: "DRAFT" };
    setSelected(null); setForm(next); savedForm.current = JSON.stringify(EMPTY_TEMPLATE); setEditorKey((key) => key + 1);
  };

  const saveTemplate = async (event: React.FormEvent) => {
    event.preventDefault(); setIsSaving(true);
    try {
      const response = await fetch(selected ? `/api/offer-letters/templates/${selected.id}` : "/api/offer-letters/templates", {
        method: selected ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save template");
      toast.success(selected ? "Template updated" : "Template created");
      setSelected(data.template);
      const saved: TemplateFormState = { name: data.template.name, description: data.template.description || "", subject: data.template.subject, bodyHtml: data.template.bodyHtml, status: data.template.status === "ARCHIVED" ? "DRAFT" : data.template.status };
      setForm(saved); savedForm.current = JSON.stringify(saved);
      await fetchTemplates();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to save template"); }
    finally { setIsSaving(false); }
  };

  const archiveTemplate = async (template: OfferLetterTemplate) => {
    if (!window.confirm(`Archive “${template.name}”? It will no longer be available for new offers.`)) return;
    try {
      const response = await fetch(`/api/offer-letters/templates/${template.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to archive template");
      toast.success("Template archived");
      if (selected?.id === template.id) startNew();
      await fetchTemplates();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to archive template"); }
  };

  const filtered = templates.filter((item) => `${item.name} ${item.description || ""}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Offer Letter Templates</h1><p className="text-sm text-foreground-secondary">Build reusable, formatted letters and insert recipient or company fields.</p></div>
        <div className="flex gap-2"><Link href="/offer-letters"><Button variant="secondary">Back to Offers</Button></Link><Button onClick={startNew}><Plus className="mr-2 h-4 w-4" />New Template</Button></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card><CardHeader><CardTitle>Templates</CardTitle></CardHeader><CardContent className="space-y-3">
          <Input aria-label="Search templates" placeholder="Search templates" value={search} onChange={(event) => setSearch(event.target.value)} />
          {isLoading ? <p className="text-sm text-foreground-secondary">Loading templates…</p> : templates.length === 0 ? <p className="text-sm text-foreground-secondary">No templates yet. Create one to get started.</p> : filtered.length === 0 ? <p className="text-sm text-foreground-secondary">No templates match your search.</p> : filtered.map((template) => (
            <div key={template.id} className={`rounded-md border p-3 ${selected?.id === template.id ? "border-primary bg-primary/5" : "border-border"}`}>
              <button type="button" onClick={() => editTemplate(template)} className="w-full text-left"><div className="flex items-center justify-between gap-2"><p className="font-medium">{template.name}</p><Badge variant={template.status === "ACTIVE" ? "success" : "default"}>{template.status}</Badge></div><p className="mt-1 text-xs text-foreground-secondary">{template._count?.offerLetters || 0} offers sent</p><p className="mt-1 text-xs text-foreground-tertiary">Updated {new Date(template.updatedAt).toLocaleDateString()}</p></button>
              <Button type="button" variant="ghost" size="sm" className="mt-1 h-7 px-2" onClick={() => duplicateTemplate(template)}><Copy className="mr-1 h-3.5 w-3.5" />Duplicate</Button>
            </div>
          ))}
        </CardContent></Card>

        <form onSubmit={saveTemplate} className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />{selected ? "Edit Template" : form.name ? "Copy Template" : "New Template"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required maxLength={200} /></div><div className="space-y-2"><Label>Status</Label><Select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as "DRAFT" | "ACTIVE" }))}><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option></Select></div></div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} maxLength={1000} /></div>
              <div className="space-y-2"><Label>Email Subject</Label><Input value={form.subject} onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))} required maxLength={300} /></div>
              <div className="space-y-2"><Label>Letter Body</Label><OfferLetterEditor key={editorKey} initialValue={form.bodyHtml} onChange={(bodyHtml) => setForm((prev) => ({ ...prev, bodyHtml }))} /></div>
              <div className="space-y-2"><div className="flex items-center justify-between"><Label>Preview</Label><span className="text-xs text-foreground-secondary">Fields appear as placeholders</span></div><div className="min-h-28 rounded-md border border-border bg-white p-5 text-sm leading-7 text-slate-900 [&_h2]:text-xl [&_li]:ml-6 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:my-3" dangerouslySetInnerHTML={{ __html: sanitizeOfferHtml(form.bodyHtml) }} /></div>
              {isDirty && <p className="text-xs font-medium text-warning">Unsaved changes</p>}
              <div className="flex justify-between gap-2">{selected && <Button type="button" variant="secondary" onClick={() => archiveTemplate(selected)}><Archive className="mr-2 h-4 w-4" />Archive</Button>}<Button type="submit" disabled={isSaving || !form.bodyHtml.trim()} className="ml-auto"><Save className="mr-2 h-4 w-4" />{isSaving ? "Saving…" : "Save Template"}</Button></div>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>Available fields</CardTitle></CardHeader><CardContent><div className="space-y-2 text-xs text-foreground-secondary"><p>Use the editor’s Insert field menu to add a field at the cursor.</p><div className="flex flex-wrap gap-2">{DEFAULT_OFFER_TAGS.map((tag) => <code key={tag} className="rounded bg-background-secondary px-2 py-1">{`{${tag}}`}</code>)}</div></div></CardContent></Card>
        </form>
      </div>
    </div>
  );
}
