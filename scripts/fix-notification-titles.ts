/**
 * One-time script to fix existing notification titles
 *
 * Removes event descriptions from notification titles and replaces them with "Notification"
 *
 * Run with: npx ts-node scripts/fix-notification-titles.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Event descriptions that should be removed from notification titles
const EVENT_DESCRIPTIONS = [
  "Notification when a shift is assigned to a carer",
  "Reminder 24 hours before shift starts",
  "Reminder 1 hour before shift starts",
  "Notification when a shift is cancelled",
  "Notification when a shift is rescheduled",
  "Confirmation when carer checks in for a shift",
  "Confirmation when carer checks out from a shift",
  "Alert when a carer misses their scheduled check-in",
  "Alert when a carer checks in late (15+ minutes)",
  "Alert when a carer checks out before scheduled end time",
  "Alert when a shift exceeds scheduled hours",
  "Alert when a shift is missed entirely (no check-in)",
  "Confirmation when a shift is completed",
  "Alert when an open shift needs coverage",
  "Notification when weekly schedule is published",
  "Alert when authorization units reach 80% usage",
  "Alert when authorization units reach 90% usage",
  "Alert when authorization units are exhausted",
  "Alert when authorization expires in 30 days",
  "Alert when authorization expires in 7 days",
  "Alert when authorization has expired",
  "Alert when an incident is reported",
  "Notification when an incident is resolved",
  "Notification when a care plan is updated",
  "Notification when a care plan is approved",
  "Reminder when an assessment is due",
  "Notification when an assessment is completed",
  "Notification when a visit note is submitted",
  "Alert when a recorded value falls outside the expected range",
  "Welcome notification for new user accounts",
  "Password reset notification",
  "Weekly summary report",
  "New message received in inbox",
];

async function main() {
  console.log("Starting notification title fix...\n");

  let totalUpdated = 0;

  for (const description of EVENT_DESCRIPTIONS) {
    const result = await prisma.notification.updateMany({
      where: {
        title: description,
      },
      data: {
        title: "Notification",
      },
    });

    if (result.count > 0) {
      console.log(`Updated ${result.count} notifications with title: "${description}"`);
      totalUpdated += result.count;
    }
  }

  console.log(`\nDone! Updated ${totalUpdated} notifications total.`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
