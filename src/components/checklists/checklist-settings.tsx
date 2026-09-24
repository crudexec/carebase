"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { checklistRequest, jsonRequest } from "@/lib/checklists/types";

interface Settings {
  checklistsEnabled: boolean;
  checklistsDashboardVisible: boolean;
}
export function ChecklistSettings({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    checklistRequest<Settings>("/api/settings/checklists")
      .then(setSettings)
      .catch((e) => setError(e.message));
  }, []);
  async function save() {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      setSettings(
        await checklistRequest<Settings>(
          "/api/settings/checklists",
          jsonRequest("PATCH", settings),
        ),
      );
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save settings");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklists</CardTitle>
        <CardDescription>
          Assign reusable checklists and approve completed items.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
        {!settings && !error && (
          <p className="text-sm">Loading checklist settings…</p>
        )}
        {settings && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="checklists-enabled" className="font-medium">
                  Enable Checklists
                </label>
                <p className="text-sm text-foreground-secondary">
                  Available to your company. Disabling preserves existing work.
                </p>
              </div>
              <Switch
                id="checklists-enabled"
                checked={settings.checklistsEnabled}
                disabled={!isAdmin || busy}
                onCheckedChange={(value) => {
                  setSettings({ ...settings, checklistsEnabled: value });
                  setSaved(false);
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="checklists-dashboard" className="font-medium">
                  Show on dashboard
                </label>
                <p className="text-sm text-foreground-secondary">
                  Show each user their latest unfinished checklist.
                </p>
              </div>
              <Switch
                id="checklists-dashboard"
                checked={settings.checklistsDashboardVisible}
                disabled={!isAdmin || busy || !settings.checklistsEnabled}
                onCheckedChange={(value) => {
                  setSettings({
                    ...settings,
                    checklistsDashboardVisible: value,
                  });
                  setSaved(false);
                }}
              />
            </div>
            {isAdmin && (
              <Button disabled={busy} onClick={save}>
                {busy ? "Saving…" : "Save checklist settings"}
              </Button>
            )}
            {saved && (
              <p role="status" className="text-sm text-green-700">
                Checklist settings saved.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
