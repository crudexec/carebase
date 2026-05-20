"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from "@/components/ui";
import type { ClientFormTemplateSettings } from "@/lib/client-forms/types";

interface TemplateSettingsPanelProps {
  settings: ClientFormTemplateSettings;
  onChange: (settings: ClientFormTemplateSettings) => void;
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
      <div>
        <div className="font-medium text-foreground">{label}</div>
        <div className="text-sm text-foreground-secondary">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4"
      />
    </label>
  );
}

export function TemplateSettingsPanel({ settings, onChange }: TemplateSettingsPanelProps) {
  return (
    <div className="space-y-6 p-6 border-l border-border overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle>Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            label="Public Access"
            description="Allow this template to be shared through request-based public links."
            checked={settings.access.isPublic}
            onChange={(checked) => onChange({ ...settings, access: { ...settings.access, isPublic: checked } })}
          />
          <ToggleRow
            label="Authenticated Access"
            description="Allow staff to submit this form from the dashboard."
            checked={settings.access.allowAuthenticatedAccess}
            onChange={(checked) =>
              onChange({
                ...settings,
                access: { ...settings.access, allowAuthenticatedAccess: checked },
              })
            }
          />
          <ToggleRow
            label="Multiple Submissions"
            description="Permit more than one public submission per generated request."
            checked={settings.access.allowMultipleSubmissionsPerRequest}
            onChange={(checked) =>
              onChange({
                ...settings,
                access: { ...settings.access, allowMultipleSubmissionsPerRequest: checked },
              })
            }
          />
          <div className="space-y-2">
            <Label htmlFor="default-expiration-days">Default expiration days</Label>
            <Input
              id="default-expiration-days"
              type="number"
              min={1}
              value={settings.access.defaultExpirationDays ?? ""}
              onChange={(e) =>
                onChange({
                  ...settings,
                  access: {
                    ...settings.access,
                    defaultExpirationDays: e.target.value ? Number(e.target.value) : null,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Public Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            label="Show Client Name"
            description="Display the client name on public forms."
            checked={settings.display.showClientName}
            onChange={(checked) =>
              onChange({
                ...settings,
                display: { ...settings.display, showClientName: checked },
              })
            }
          />
          <ToggleRow
            label="Show Client Date of Birth"
            description="Display the client date of birth on public forms."
            checked={settings.display.showClientDob}
            onChange={(checked) =>
              onChange({
                ...settings,
                display: { ...settings.display, showClientDob: checked },
              })
            }
          />
          <div className="space-y-2">
            <Label htmlFor="public-title">Public title</Label>
            <Input
              id="public-title"
              value={settings.display.publicTitle ?? ""}
              onChange={(e) =>
                onChange({
                  ...settings,
                  display: { ...settings.display, publicTitle: e.target.value || null },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="public-description">Public description</Label>
            <Textarea
              id="public-description"
              rows={3}
              value={settings.display.publicDescription ?? ""}
              onChange={(e) =>
                onChange({
                  ...settings,
                  display: { ...settings.display, publicDescription: e.target.value || null },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="success-message">Success message</Label>
            <Textarea
              id="success-message"
              rows={3}
              value={settings.display.successMessage ?? ""}
              onChange={(e) =>
                onChange({
                  ...settings,
                  display: { ...settings.display, successMessage: e.target.value || null },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submitter Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            label="Collect submitter name"
            description="Ask the public user to identify themselves by name."
            checked={settings.collection.collectSubmitterName}
            onChange={(checked) =>
              onChange({
                ...settings,
                collection: { ...settings.collection, collectSubmitterName: checked },
              })
            }
          />
          <ToggleRow
            label="Collect submitter email"
            description="Ask the public user for an email address."
            checked={settings.collection.collectSubmitterEmail}
            onChange={(checked) =>
              onChange({
                ...settings,
                collection: { ...settings.collection, collectSubmitterEmail: checked },
              })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
