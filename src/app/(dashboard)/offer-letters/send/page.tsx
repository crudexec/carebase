"use client";

import * as React from "react";
import Link from "next/link";
import { UserRole } from "@prisma/client";
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
} from "@/components/ui";
import { Eye, Send } from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  status: string;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: UserRole;
}

const STAFF_ROLES: UserRole[] = [
  "ADMIN",
  "OPS_MANAGER",
  "CLINICAL_DIRECTOR",
  "STAFF",
  "SUPERVISOR",
  "CARER",
];

export default function SendOfferLetterPage() {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [recipientType, setRecipientType] = React.useState<"staff" | "candidate">("candidate");
  const [employeeId, setEmployeeId] = React.useState("");
  const [templateId, setTemplateId] = React.useState("");
  const [candidate, setCandidate] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "CARER" as UserRole,
  });
  const [expiresInDays, setExpiresInDays] = React.useState(14);
  const [preview, setPreview] = React.useState<{ subject: string; bodyHtml: string; unknownTags: string[] } | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      const [templatesRes, staffRes] = await Promise.all([
        fetch("/api/offer-letters/templates"),
        fetch("/api/staff?limit=100"),
      ]);
      const templatesData = await templatesRes.json();
      const staffData = await staffRes.json();
      if (templatesRes.ok) {
        setTemplates(templatesData.templates || []);
        if (templatesData.templates?.[0]) setTemplateId(templatesData.templates[0].id);
      }
      if (staffRes.ok) {
        setStaff(staffData.staff || []);
      }
    }
    loadData().catch(() => toast.error("Failed to load offer letter data"));
  }, []);

  const selectedTemplate = templates.find((template) => template.id === templateId);

  const buildPayload = () => ({
    templateId,
    ...(recipientType === "staff"
      ? { employeeId }
      : {
          recipientFirstName: candidate.firstName,
          recipientLastName: candidate.lastName,
          recipientEmail: candidate.email,
          recipientPhone: candidate.phone || undefined,
          recipientRole: candidate.role,
        }),
    offerData: {},
    expiresInDays,
  });

  const handlePreview = async () => {
    if (!selectedTemplate) {
      toast.error("Select a template");
      return;
    }
    try {
      const response = await fetch("/api/offer-letters/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedTemplate.subject,
          bodyHtml: selectedTemplate.bodyHtml,
          ...buildPayload(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to preview offer");
      setPreview(data);
      if (data.unknownTags?.length) {
        toast.error(`Unresolved tags: ${data.unknownTags.join(", ")}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to preview offer");
    }
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/offer-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send offer");
      toast.success("Offer letter sent");
      setPreview(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Send Offer Letter</h1>
          <p className="text-sm text-foreground-secondary">
            Send an offer to an existing staff member or a candidate.
          </p>
        </div>
        <Link href="/offer-letters">
          <Button variant="secondary">Back to Offers</Button>
        </Link>
      </div>

      <form onSubmit={handleSend} className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Recipient Type</Label>
                  <Select value={recipientType} onChange={(event) => setRecipientType(event.target.value as "staff" | "candidate")}>
                    <option value="candidate">Candidate</option>
                    <option value="staff">Existing Staff</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={templateId} onChange={(event) => setTemplateId(event.target.value)} required>
                    <option value="">Select template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.status})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {recipientType === "staff" ? (
                  <div className="space-y-2">
                    <Label>Staff Member</Label>
                    <Select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} required>
                      <option value="">Select staff...</option>
                      {staff.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName} ({member.email})
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={candidate.firstName}
                        onChange={(event) => setCandidate((prev) => ({ ...prev, firstName: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={candidate.lastName}
                        onChange={(event) => setCandidate((prev) => ({ ...prev, lastName: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={candidate.email}
                        onChange={(event) => setCandidate((prev) => ({ ...prev, email: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={candidate.phone}
                        onChange={(event) => setCandidate((prev) => ({ ...prev, phone: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={candidate.role}
                        onChange={(event) => setCandidate((prev) => ({ ...prev, role: event.target.value as UserRole }))}
                      >
                        {STAFF_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label>Expires In Days</Label>
                  <Input
                    type="number"
                    min={1}
                    max={90}
                    value={expiresInDays}
                    onChange={(event) => setExpiresInDays(Number(event.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button type="button" variant="secondary" className="w-full" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>

              {preview && (
                <div className="space-y-3 rounded-md border border-border p-4">
                  <div>
                    <p className="text-xs text-foreground-tertiary">Subject</p>
                    <p className="font-medium">{preview.subject}</p>
                  </div>
                  {preview.unknownTags.length > 0 && (
                    <div className="rounded-md border border-error/20 bg-error/10 p-3">
                      <p className="text-sm font-medium text-error">
                        This template contains unresolved tags.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {preview.unknownTags.map((tag) => (
                          <Badge key={tag} variant="error">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                    {preview.bodyHtml}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !templateId || Boolean(preview?.unknownTags.length)}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send Offer Letter"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
