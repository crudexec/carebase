"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Breadcrumb,
} from "@/components/ui";
import { Save, Loader2, Languages, CheckCircle } from "lucide-react";
import {
  TerminologyKey,
  TerminologySettings,
  TERMINOLOGY_OPTIONS,
  DEFAULT_TERMINOLOGY,
  getTerminologyCategoryLabel,
  getTerminologyCategoryDescription,
} from "@/lib/terminology";
import { useTerminology } from "@/components/providers/terminology-provider";

export default function TerminologySettingsPage() {
  const { refresh } = useTerminology();
  const [settings, setSettings] = useState<TerminologySettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<TerminologySettings>({});

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/settings/terminology");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();
      const loadedSettings = data.terminology || {};
      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
    } catch (err) {
      console.error("Error fetching terminology settings:", err);
      toast.error("Failed to load terminology settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Track changes
  useEffect(() => {
    const changed = Object.keys(TERMINOLOGY_OPTIONS).some((key) => {
      const k = key as TerminologyKey;
      const current = settings[k] || DEFAULT_TERMINOLOGY[k];
      const original = originalSettings[k] || DEFAULT_TERMINOLOGY[k];
      return current !== original;
    });
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/settings/terminology", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setOriginalSettings(settings);
      setHasChanges(false);
      toast.success("Terminology settings saved successfully");

      // Refresh the terminology context
      await refresh();
    } catch (err) {
      console.error("Error saving terminology settings:", err);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptionChange = (key: TerminologyKey, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getCurrentValue = (key: TerminologyKey): string => {
    return settings[key] || DEFAULT_TERMINOLOGY[key];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const terminologyKeys: TerminologyKey[] = ["visitNote", "client", "carer", "shift"];

  return (
    <div className="space-y-6 max-w-3xl">
      <Breadcrumb
        items={[{ label: "Settings", href: "/settings" }, { label: "Terminology" }]}
      />

      <div>
        <h1 className="text-2xl font-semibold">Terminology Settings</h1>
        <p className="text-foreground-secondary">
          Customize the labels used throughout the application to match your care model
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Languages className="w-5 h-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">
              Customize terminology for your organization
            </p>
            <p className="text-foreground-secondary mt-1">
              Different care models use different terms. Choose the terminology that best
              fits how your organization operates. These labels will be used throughout
              the application, in navigation, forms, and notifications.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terminology Options */}
      <div className="space-y-4">
        {terminologyKeys.map((key) => (
          <Card key={key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{getTerminologyCategoryLabel(key)}</CardTitle>
              <CardDescription>{getTerminologyCategoryDescription(key)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(TERMINOLOGY_OPTIONS[key]).map(([optionKey, option]) => {
                  const isSelected = getCurrentValue(key) === optionKey;
                  return (
                    <button
                      key={optionKey}
                      type="button"
                      onClick={() => handleOptionChange(key, optionKey)}
                      className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-background-secondary"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-primary" />
                      )}
                      <p className="font-medium">{option.singular}</p>
                      <p className="text-sm text-foreground-secondary">{option.plural}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>See how your terminology choices will appear</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-background-secondary rounded-lg p-4 space-y-2 text-sm">
            <p>
              <span className="text-foreground-secondary">Navigation:</span>{" "}
              <span className="font-medium">
                {TERMINOLOGY_OPTIONS.visitNote[getCurrentValue("visitNote")]?.plural || "Visit Notes"}
              </span>
            </p>
            <p>
              <span className="text-foreground-secondary">Page title:</span>{" "}
              <span className="font-medium">
                New {TERMINOLOGY_OPTIONS.visitNote[getCurrentValue("visitNote")]?.singular || "Visit Note"} for{" "}
                {TERMINOLOGY_OPTIONS.client[getCurrentValue("client")]?.singular || "Client"}
              </span>
            </p>
            <p>
              <span className="text-foreground-secondary">Success message:</span>{" "}
              <span className="font-medium">
                {TERMINOLOGY_OPTIONS.visitNote[getCurrentValue("visitNote")]?.singular || "Visit Note"} submitted
                successfully
              </span>
            </p>
            <p>
              <span className="text-foreground-secondary">Scheduling:</span>{" "}
              <span className="font-medium">
                {TERMINOLOGY_OPTIONS.carer[getCurrentValue("carer")]?.singular || "Carer"}&apos;s{" "}
                {TERMINOLOGY_OPTIONS.shift[getCurrentValue("shift")]?.plural || "Shifts"}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-sm text-foreground-secondary">
          {hasChanges ? "You have unsaved changes" : "All changes saved"}
        </p>
        <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
