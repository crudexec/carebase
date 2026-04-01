"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Mail,
  Smartphone,
  Loader2,
  AlertCircle,
  CheckCircle,
  Save,
  ChevronDown,
  ChevronRight,
  Calendar,
  Shield,
  Heart,
  Users,
  UserPlus,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelPreference {
  channel: "EMAIL" | "IN_APP" | "SMS" | "WHATSAPP";
  enabled: boolean;
  isDefault: boolean;
}

interface EventPreference {
  eventType: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  channels: ChannelPreference[];
}

const EVENT_CATEGORIES: Record<string, { label: string; icon: React.ElementType; events: string[] }> = {
  SHIFTS: {
    label: "Shift Notifications",
    icon: Calendar,
    events: [
      "SHIFT_ASSIGNED",
      "SHIFT_REMINDER_24H",
      "SHIFT_REMINDER_1H",
      "SHIFT_CANCELLED",
      "SHIFT_RESCHEDULED",
      "CHECK_IN_CONFIRMATION",
      "CHECK_OUT_CONFIRMATION",
      "MISSED_CHECK_IN",
      "LATE_CHECK_IN",
      "EARLY_CHECK_OUT",
      "OVERTIME_ALERT",
      "NO_SHOW_ALERT",
      "SHIFT_COMPLETED",
      "COVERAGE_NEEDED",
      "WEEKLY_SCHEDULE_PUBLISHED",
    ],
  },
  AUTHORIZATIONS: {
    label: "Authorization Alerts",
    icon: Shield,
    events: [
      "AUTH_UNITS_80_PERCENT",
      "AUTH_UNITS_90_PERCENT",
      "AUTH_UNITS_EXHAUSTED",
      "AUTH_EXPIRING_30_DAYS",
      "AUTH_EXPIRING_7_DAYS",
      "AUTH_EXPIRED",
    ],
  },
  CARE: {
    label: "Care Updates",
    icon: Heart,
    events: [
      "INCIDENT_REPORTED",
      "INCIDENT_RESOLVED",
      "CARE_PLAN_UPDATED",
      "CARE_PLAN_APPROVED",
      "ASSESSMENT_DUE",
      "ASSESSMENT_COMPLETED",
      "VISIT_NOTE_SUBMITTED",
    ],
  },
  ADMIN: {
    label: "Administrative",
    icon: Users,
    events: [
      "USER_ACCOUNT_CREATED",
      "PASSWORD_RESET",
      "WEEKLY_SUMMARY",
    ],
  },
};

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  EMAIL: Mail,
  IN_APP: Bell,
  SMS: Smartphone,
  WHATSAPP: Smartphone,
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  CRITICAL: "bg-red-100 text-red-700",
};

// Sponsor email toggle configuration (admin only)
const SPONSOR_EMAIL_TOGGLES = [
  {
    key: "sponsorEmailInvite",
    label: "Sponsor Invitation",
    description: "Send invitation emails when inviting new sponsors",
    icon: Mail,
  },
  {
    key: "sponsorEmailWelcome",
    label: "Welcome Email",
    description: "Send welcome emails when sponsors create their accounts",
    icon: UserPlus,
  },
  {
    key: "sponsorEmailCheckIn",
    label: "Check-In Confirmation",
    description: "Notify sponsors when caregivers check in for shifts",
    icon: Clock,
  },
  {
    key: "sponsorEmailCheckOut",
    label: "Check-Out Confirmation",
    description: "Notify sponsors when caregivers check out from shifts",
    icon: Clock,
  },
  {
    key: "sponsorEmailShiftCompleted",
    label: "Shift Completed",
    description: "Notify sponsors when shifts are fully completed",
    icon: CheckCircle,
  },
  {
    key: "sponsorEmailIncidentReported",
    label: "Incident Reported",
    description: "Notify sponsors when incidents involving their clients are reported",
    icon: AlertTriangle,
  },
];

interface SponsorEmailSettings {
  sponsorEmailInvite: boolean;
  sponsorEmailWelcome: boolean;
  sponsorEmailCheckIn: boolean;
  sponsorEmailCheckOut: boolean;
  sponsorEmailShiftCompleted: boolean;
  sponsorEmailIncidentReported: boolean;
}

export default function NotificationPreferencesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [preferences, setPreferences] = useState<EventPreference[]>([]);
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    SHIFTS: true,
    AUTHORIZATIONS: false,
    CARE: false,
    ADMIN: false,
    SPONSOR_EMAILS: true,
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Sponsor email settings (admin only)
  const [sponsorEmailSettings, setSponsorEmailSettings] = useState<SponsorEmailSettings | null>(null);
  const [isSavingSponsorSettings, setIsSavingSponsorSettings] = useState(false);
  const [sponsorSettingsHasChanges, setSponsorSettingsHasChanges] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/preferences");
      if (!response.ok) throw new Error("Failed to fetch preferences");
      const data = await response.json();
      setPreferences(data.preferences);
      setAvailableChannels(data.availableChannels);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preferences");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch sponsor email settings (admin only)
  const fetchSponsorEmailSettings = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const response = await fetch("/api/settings/sponsor-emails");
      if (response.ok) {
        const data = await response.json();
        setSponsorEmailSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch sponsor email settings:", err);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchPreferences();
      fetchSponsorEmailSettings();
    }
  }, [sessionStatus, fetchPreferences, fetchSponsorEmailSettings]);

  const toggleChannel = (eventType: string, channel: string) => {
    setPreferences((prev) =>
      prev.map((pref) => {
        if (pref.eventType === eventType) {
          return {
            ...pref,
            channels: pref.channels.map((ch) =>
              ch.channel === channel ? { ...ch, enabled: !ch.enabled, isDefault: false } : ch
            ),
          };
        }
        return pref;
      })
    );
    setHasChanges(true);
    setSuccess(null);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Flatten preferences for API
      const flatPreferences: { eventType: string; channel: string; enabled: boolean }[] = [];
      for (const pref of preferences) {
        for (const ch of pref.channels) {
          flatPreferences.push({
            eventType: pref.eventType,
            channel: ch.channel,
            enabled: ch.enabled,
          });
        }
      }

      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: flatPreferences }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || "Failed to save preferences");
      }

      setSuccess("Notification preferences saved successfully");
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  // Save sponsor email settings (admin only)
  const handleSaveSponsorSettings = async () => {
    if (!sponsorEmailSettings) return;

    setIsSavingSponsorSettings(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/settings/sponsor-emails", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sponsorEmailSettings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save sponsor email settings");
      }

      setSuccess("Sponsor email settings saved successfully");
      setSponsorSettingsHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSavingSponsorSettings(false);
    }
  };

  const formatEventName = (eventType: string): string => {
    return eventType
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/Auth /g, "Authorization ")
      .replace(/24h/gi, "24 Hours")
      .replace(/1h/gi, "1 Hour")
      .replace(/7 Days/gi, "7 Days")
      .replace(/30 Days/gi, "30 Days")
      .replace(/80 Percent/gi, "80%")
      .replace(/90 Percent/gi, "90%");
  };

  const getPreferencesForCategory = (category: string): EventPreference[] => {
    const categoryEvents = EVENT_CATEGORIES[category]?.events || [];
    return preferences.filter((p) => categoryEvents.includes(p.eventType));
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Notification Preferences</h1>
          <p className="text-sm text-foreground-secondary">
            Choose how you want to receive notifications
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-error-light text-red-800 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-800 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Channel Legend */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-foreground-secondary">Channels:</span>
            {availableChannels.map((channel) => {
              const Icon = CHANNEL_ICONS[channel] || Bell;
              return (
                <div key={channel} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-foreground-secondary" />
                  <span className="text-sm text-foreground">{channel === "IN_APP" ? "In-App" : channel}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sponsor Email Settings - Admin Only */}
      {isAdmin && sponsorEmailSettings && (
        <Card>
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => toggleCategory("SPONSOR_EMAILS")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Sponsor Email Settings</CardTitle>
                  <CardDescription>
                    Company-wide controls for sponsor notifications
                  </CardDescription>
                </div>
              </div>
              {expandedCategories["SPONSOR_EMAILS"] ? (
                <ChevronDown className="w-5 h-5 text-foreground-secondary" />
              ) : (
                <ChevronRight className="w-5 h-5 text-foreground-secondary" />
              )}
            </div>
          </CardHeader>

          {expandedCategories["SPONSOR_EMAILS"] && (
            <CardContent className="pt-0">
              <div className="divide-y divide-border">
                {SPONSOR_EMAIL_TOGGLES.map((toggle) => {
                  const Icon = toggle.icon;
                  const settingKey = toggle.key as keyof SponsorEmailSettings;
                  return (
                    <div key={toggle.key} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-foreground-tertiary" />
                          <div>
                            <span className="text-sm font-medium text-foreground">
                              {toggle.label}
                            </span>
                            <p className="text-xs text-foreground-secondary mt-0.5">
                              {toggle.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={sponsorEmailSettings[settingKey]}
                          onCheckedChange={(checked) => {
                            setSponsorEmailSettings((prev) =>
                              prev ? { ...prev, [settingKey]: checked } : null
                            );
                            setSponsorSettingsHasChanges(true);
                            setSuccess(null);
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Button for Sponsor Settings */}
              <div className="pt-4 mt-4 border-t border-border">
                <Button
                  onClick={handleSaveSponsorSettings}
                  disabled={isSavingSponsorSettings || !sponsorSettingsHasChanges}
                  size="sm"
                >
                  {isSavingSponsorSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Sponsor Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Preference Categories */}
      {Object.entries(EVENT_CATEGORIES).map(([categoryKey, category]) => {
        const categoryPrefs = getPreferencesForCategory(categoryKey);
        if (categoryPrefs.length === 0) return null;

        const Icon = category.icon;
        const isExpanded = expandedCategories[categoryKey];

        return (
          <Card key={categoryKey}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleCategory(categoryKey)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{category.label}</CardTitle>
                    <CardDescription>
                      {categoryPrefs.length} notification type{categoryPrefs.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-foreground-secondary" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-foreground-secondary" />
                )}
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="divide-y divide-border">
                  {categoryPrefs.map((pref) => (
                    <div key={pref.eventType} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {formatEventName(pref.eventType)}
                            </span>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                PRIORITY_COLORS[pref.priority]
                              )}
                            >
                              {pref.priority.toLowerCase()}
                            </span>
                          </div>
                          <p className="text-xs text-foreground-secondary mt-1">
                            {pref.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {availableChannels.map((channel) => {
                            const channelPref = pref.channels.find((c) => c.channel === channel);
                            const Icon = CHANNEL_ICONS[channel] || Bell;

                            return (
                              <div key={channel} className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-foreground-tertiary" />
                                <Switch
                                  checked={channelPref?.enabled ?? false}
                                  onCheckedChange={() => toggleChannel(pref.eventType, channel)}
                                  aria-label={`${channel} notifications for ${pref.eventType}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Info about SMS/WhatsApp */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">SMS & WhatsApp Coming Soon</p>
              <p className="text-xs text-amber-700 mt-1">
                SMS and WhatsApp notifications will be available in a future update.
                Add your phone number to your profile to be ready when they launch.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
