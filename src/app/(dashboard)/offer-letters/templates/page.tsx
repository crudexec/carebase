"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import { DEFAULT_OFFER_TAGS } from "@/lib/offer-letters/rendering";
import { Archive, FileText, Plus, Save } from "lucide-react";

interface OfferLetterTemplate {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  bodyHtml: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  updatedAt: string;
  _count?: { offerLetters: number };
}

type TemplateFormState = {
  name: string;
  description: string;
  subject: string;
  bodyHtml: string;
  status: "DRAFT" | "ACTIVE";
};

const EMPTY_TEMPLATE = {
  name: "",
  description: "",
  subject: "Offer Letter for {employee.firstName} {employee.lastName}",
  bodyHtml:
    "Dear {employee.firstName},\n\nWe are pleased to extend this offer letter from {company.name}.\n\nPlease review the terms outlined in this letter and sign to acknowledge acceptance.\n\nSincerely,\n{company.name}",
  status: "DRAFT",
} satisfies TemplateFormState;

export default function OfferLetterTemplatesPage() {
  const [templates, setTemplates] = React.useState<OfferLetterTemplate[]>([]);
  const [selected, setSelected] = React.useState<OfferLetterTemplate | null>(null);
  const [form, setForm] = React.useState<TemplateFormState>(EMPTY_TEMPLATE);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const fetchTemplates = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/offer-letters/templates");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch templates");
      setTemplates(data.templates || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const startNew = () => {
    setSelected(null);
    setForm(EMPTY_TEMPLATE);
  };

  const editTemplate = (template: OfferLetterTemplate) => {
    setSelected(template);
    setForm({
      name: template.name,
      description: template.description || "",
      subject: template.subject,
      bodyHtml: template.bodyHtml,
      status: template.status === "ARCHIVED" ? "DRAFT" : template.status,
    });
  };

  const saveTemplate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(
        selected ? `/api/offer-letters/templates/${selected.id}` : "/api/offer-letters/templates",
        {
          method: selected ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save template");
      toast.success(selected ? "Template updated" : "Template created");
      setSelected(data.template);
      await fetchTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const archiveTemplate = async (template: OfferLetterTemplate) => {
    try {
      const response = await fetch(`/api/offer-letters/templates/${template.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to archive template");
      toast.success("Template archived");
      if (selected?.id === template.id) startNew();
      fetchTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to archive template");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Offer Letter Templates</h1>
          <p className="text-sm text-foreground-secondary">
            Create reusable letters with curly-brace tags.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/offer-letters">
            <Button variant="secondary">Back to Offers</Button>
          </Link>
          <Button onClick={startNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-foreground-secondary">Loading...</p>
            ) : templates.length === 0 ? (
              <p className="text-sm text-foreground-secondary">No templates yet.</p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => editTemplate(template)}
                    className="w-full rounded-md border border-border p-3 text-left hover:bg-background-secondary"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{template.name}</p>
                      <Badge variant={template.status === "ACTIVE" ? "success" : "default"}>
                        {template.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1">
                      {template._count?.offerLetters || 0} sent
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={saveTemplate} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selected ? "Edit Template" : "New Template"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, status: event.target.value as "DRAFT" | "ACTIVE" }))
                    }
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input
                  value={form.subject}
                  onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Letter Body</Label>
                <Textarea
                  value={form.bodyHtml}
                  onChange={(event) => setForm((prev) => ({ ...prev, bodyHtml: event.target.value }))}
                  rows={16}
                  required
                />
              </div>

              <div className="flex justify-between gap-2">
                {selected && (
                  <Button type="button" variant="secondary" onClick={() => archiveTemplate(selected)}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                )}
                <Button type="submit" disabled={isSaving} className="ml-auto">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_OFFER_TAGS.map((tag) => (
                  <code key={tag} className="rounded bg-background-secondary px-2 py-1 text-xs">
                    {"{"}{tag}{"}"}
                  </code>
                ))}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
