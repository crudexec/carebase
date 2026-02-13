"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface EVVSettings {
  evvEnabled: boolean;
  defaultGeofenceRadius: number;
}

export default function EVVSettingsPage() {
  const [settings, setSettings] = useState<EVVSettings>({
    evvEnabled: true,
    defaultGeofenceRadius: 150,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/settings/evv");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error("Error fetching EVV settings:", err);
      setError("Failed to load EVV settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/settings/evv", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving EVV settings:", err);
      setError("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">EVV Settings</h1>
        <p className="text-foreground-secondary">
          Configure Electronic Visit Verification for your organization
        </p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-error" />
          <p className="text-error">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success" />
          <p className="text-success">Settings saved successfully</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Geofencing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* EVV Enabled Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable EVV</Label>
              <p className="text-sm text-foreground-secondary">
                Require location verification for check-in/check-out
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.evvEnabled}
              onClick={() =>
                setSettings((s) => ({ ...s, evvEnabled: !s.evvEnabled }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.evvEnabled ? "bg-primary" : "bg-foreground-tertiary"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.evvEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Default Geofence Radius */}
          <div className="space-y-3">
            <Label>Default Geofence Radius (meters)</Label>
            <div className="flex items-center gap-4">
              <Input
                type="range"
                min="50"
                max="500"
                step="10"
                value={settings.defaultGeofenceRadius}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    defaultGeofenceRadius: parseInt(e.target.value),
                  }))
                }
                className="flex-1"
              />
              <Input
                type="number"
                min="50"
                max="1000"
                value={settings.defaultGeofenceRadius}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    defaultGeofenceRadius: parseInt(e.target.value) || 150,
                  }))
                }
                className="w-24"
              />
            </div>
            <p className="text-xs text-foreground-tertiary">
              This is the default radius used when a client doesn&apos;t have a
              specific radius configured. Recommended: 100-200 meters.
            </p>

            {/* Visual representation */}
            <div className="bg-background-secondary rounded-lg p-4 mt-4">
              <div className="flex items-center justify-center">
                <div
                  className="relative rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center"
                  style={{
                    width: `${Math.min(settings.defaultGeofenceRadius / 2, 200)}px`,
                    height: `${Math.min(settings.defaultGeofenceRadius / 2, 200)}px`,
                  }}
                >
                  <div className="absolute w-3 h-3 bg-primary rounded-full" />
                  <span className="absolute -bottom-6 text-xs text-foreground-secondary">
                    {settings.defaultGeofenceRadius}m radius
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setSettings((s) => ({ ...s, defaultGeofenceRadius: 100 }))
                }
              >
                100m (Strict)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setSettings((s) => ({ ...s, defaultGeofenceRadius: 150 }))
                }
              >
                150m (Recommended)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setSettings((s) => ({ ...s, defaultGeofenceRadius: 250 }))
                }
              >
                250m (Relaxed)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setSettings((s) => ({ ...s, defaultGeofenceRadius: 400 }))
                }
              >
                400m (Rural)
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About EVV</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground-secondary space-y-2">
          <p>
            Electronic Visit Verification (EVV) captures GPS coordinates during
            caregiver check-in and check-out to verify visits occurred at the
            client&apos;s location.
          </p>
          <p>
            The geofence radius determines how close a caregiver must be to the
            client&apos;s address for the check-in to be considered compliant.
          </p>
          <p>
            Individual clients can have custom geofence radii set in their
            profile to accommodate different living situations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
