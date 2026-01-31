import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserPreferences,
  updateUserPreferences,
  EVENT_CONFIGS,
  getEventsForRole,
} from "@/lib/notifications";
import { NotificationChannel, NotificationEventType } from "@prisma/client";
import { z } from "zod";
import type { RecipientRole } from "@/lib/notifications/types";

// Validation schema for updating preferences
const updatePreferencesSchema = z.object({
  preferences: z.array(
    z.object({
      eventType: z.string(),
      channel: z.string(),
      enabled: z.boolean(),
    })
  ),
});

// GET /api/notifications/preferences - Get user's notification preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role as RecipientRole;

    // Get user's saved preferences
    const savedPreferences = await getUserPreferences(userId);

    // Get events relevant to this user's role
    const relevantEvents = getEventsForRole(userRole);

    // Build a complete list of preferences with defaults
    const allPreferences: {
      eventType: NotificationEventType;
      channel: NotificationChannel;
      enabled: boolean;
      isDefault: boolean;
    }[] = [];

    for (const eventConfig of relevantEvents) {
      // For each default channel of this event
      const availableChannels: NotificationChannel[] = ["EMAIL", "IN_APP"];

      for (const channel of availableChannels) {
        // Check if user has a saved preference
        const savedPref = savedPreferences.preferences.find(
          (p) => p.eventType === eventConfig.eventType && p.channel === channel
        );

        if (savedPref) {
          allPreferences.push({
            eventType: eventConfig.eventType,
            channel,
            enabled: savedPref.enabled,
            isDefault: false,
          });
        } else {
          // Use default from event config
          allPreferences.push({
            eventType: eventConfig.eventType,
            channel,
            enabled: eventConfig.defaultChannels.includes(channel),
            isDefault: true,
          });
        }
      }
    }

    // Group preferences by event type for easier UI consumption
    const groupedPreferences: Record<
      string,
      {
        eventType: NotificationEventType;
        description: string;
        priority: string;
        channels: {
          channel: NotificationChannel;
          enabled: boolean;
          isDefault: boolean;
        }[];
      }
    > = {};

    for (const pref of allPreferences) {
      if (!groupedPreferences[pref.eventType]) {
        const eventConfig = EVENT_CONFIGS[pref.eventType];
        groupedPreferences[pref.eventType] = {
          eventType: pref.eventType,
          description: eventConfig?.description || pref.eventType,
          priority: eventConfig?.priority || "MEDIUM",
          channels: [],
        };
      }
      groupedPreferences[pref.eventType].channels.push({
        channel: pref.channel,
        enabled: pref.enabled,
        isDefault: pref.isDefault,
      });
    }

    return NextResponse.json({
      preferences: Object.values(groupedPreferences),
      availableChannels: ["EMAIL", "IN_APP"],
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences - Update user's notification preferences
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updatePreferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { preferences } = validation.data;

    // Validate that event types and channels are valid
    const validPreferences = preferences.map((p) => ({
      eventType: p.eventType as NotificationEventType,
      channel: p.channel as NotificationChannel,
      enabled: p.enabled,
    }));

    await updateUserPreferences(
      session.user.id,
      session.user.companyId,
      validPreferences
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    // Include more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update notification preferences", details: errorMessage },
      { status: 500 }
    );
  }
}
