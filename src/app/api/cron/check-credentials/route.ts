import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CredentialStatus, NotificationEventType } from "@prisma/client";
import { sendNotification } from "@/lib/notifications";

// This endpoint should be called daily by a cron job
// It checks for expiring credentials and creates alerts

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      credentialsChecked: 0,
      statusUpdated: 0,
      alertsCreated: 0,
      errors: [] as string[],
    };

    // Get all active companies
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    for (const company of companies) {
      try {
        // Get all credentials for this company with their types
        const credentials = await prisma.caregiverCredential.findMany({
          where: {
            caregiverProfile: {
              user: { companyId: company.id },
            },
          },
          include: {
            credentialType: true,
            caregiverProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });

        results.credentialsChecked += credentials.length;

        for (const credential of credentials) {
          const now = new Date();
          const expirationDate = new Date(credential.expirationDate);
          const daysUntilExpiration = Math.ceil(
            (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Calculate expected status
          let expectedStatus: CredentialStatus;
          if (daysUntilExpiration < 0) {
            expectedStatus = CredentialStatus.EXPIRED;
          } else {
            const minReminderDays = Math.min(...credential.credentialType.reminderDays);
            if (daysUntilExpiration <= minReminderDays) {
              expectedStatus = CredentialStatus.EXPIRING_SOON;
            } else {
              expectedStatus = CredentialStatus.ACTIVE;
            }
          }

          // Update status if changed
          if (credential.status !== expectedStatus && credential.status !== CredentialStatus.REVOKED) {
            await prisma.caregiverCredential.update({
              where: { id: credential.id },
              data: { status: expectedStatus },
            });
            results.statusUpdated++;
          }

          // Check if we need to send reminders
          const reminderDays = credential.credentialType.reminderDays;
          const sentReminders = credential.remindersSentDays || [];

          for (const reminderDay of reminderDays) {
            // Check if this reminder should be sent (within the day range and not already sent)
            if (
              daysUntilExpiration <= reminderDay &&
              daysUntilExpiration > reminderDay - 7 && // Within a week of the reminder day
              !sentReminders.includes(reminderDay)
            ) {
              // Create an alert for this reminder
              const severity = getSeverityForDays(daysUntilExpiration);
              const alertType = getAlertTypeForDays(daysUntilExpiration);
              const message = getMessageForDays(
                daysUntilExpiration,
                credential.credentialType.name,
                `${credential.caregiverProfile.user.firstName} ${credential.caregiverProfile.user.lastName}`
              );

              // Check if similar alert already exists (within last 24 hours)
              const existingAlert = await prisma.credentialAlert.findFirst({
                where: {
                  credentialId: credential.id,
                  alertType,
                  createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                  },
                },
              });

              if (!existingAlert) {
                await prisma.credentialAlert.create({
                  data: {
                    alertType,
                    message,
                    severity,
                    credentialId: credential.id,
                    companyId: company.id,
                  },
                });
                results.alertsCreated++;

                // Update the credential to mark this reminder as sent
                await prisma.caregiverCredential.update({
                  where: { id: credential.id },
                  data: {
                    remindersSentDays: [...sentReminders, reminderDay],
                    lastReminderSent: new Date(),
                  },
                });

                // Send notifications to caregiver and admins
                const notificationEventType = getNotificationEventType(daysUntilExpiration);
                if (notificationEventType) {
                  // Get admin users for this company
                  const adminUsers = await prisma.user.findMany({
                    where: {
                      companyId: company.id,
                      role: { in: ["ADMIN", "OPS_MANAGER"] },
                      isActive: true,
                    },
                    select: { id: true },
                  });

                  const recipientIds = [
                    credential.caregiverProfile.user.id,
                    ...adminUsers.map((u) => u.id),
                  ];

                  // Send notification
                  sendNotification({
                    eventType: notificationEventType,
                    recipientIds,
                    data: {
                      carerName: `${credential.caregiverProfile.user.firstName} ${credential.caregiverProfile.user.lastName}`,
                      credentialName: credential.credentialType.name,
                      expirationDate: credential.expirationDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }),
                      daysRemaining: daysUntilExpiration.toString(),
                    },
                  }).catch((err) => {
                    console.error("Failed to send credential notification:", err);
                  });

                  // Create audit log entry for activity feed
                  await prisma.auditLog.create({
                    data: {
                      companyId: company.id,
                      userId: credential.caregiverProfile.user.id,
                      action: `CREDENTIAL_${alertType}`,
                      entityType: "CaregiverCredential",
                      entityId: credential.id,
                      changes: {
                        credentialType: credential.credentialType.name,
                        expirationDate: credential.expirationDate.toISOString(),
                        daysUntilExpiration,
                        severity,
                      },
                    },
                  });
                }
              }
            }
          }

          // Check for expired credentials that haven't had an expired alert
          if (daysUntilExpiration < 0 && !credential.expiredAlertSent) {
            const existingExpiredAlert = await prisma.credentialAlert.findFirst({
              where: {
                credentialId: credential.id,
                alertType: "EXPIRED",
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Within last week
                },
              },
            });

            if (!existingExpiredAlert) {
              await prisma.credentialAlert.create({
                data: {
                  alertType: "EXPIRED",
                  message: `${credential.credentialType.name} for ${credential.caregiverProfile.user.firstName} ${credential.caregiverProfile.user.lastName} has expired`,
                  severity: "CRITICAL",
                  credentialId: credential.id,
                  companyId: company.id,
                },
              });
              results.alertsCreated++;

              await prisma.caregiverCredential.update({
                where: { id: credential.id },
                data: { expiredAlertSent: true },
              });

              // Send expired notification to caregiver and admins
              const adminUsers = await prisma.user.findMany({
                where: {
                  companyId: company.id,
                  role: { in: ["ADMIN", "OPS_MANAGER"] },
                  isActive: true,
                },
                select: { id: true },
              });

              const recipientIds = [
                credential.caregiverProfile.user.id,
                ...adminUsers.map((u) => u.id),
              ];

              sendNotification({
                eventType: "CREDENTIAL_EXPIRED",
                recipientIds,
                data: {
                  carerName: `${credential.caregiverProfile.user.firstName} ${credential.caregiverProfile.user.lastName}`,
                  credentialName: credential.credentialType.name,
                  expirationDate: credential.expirationDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }),
                },
              }).catch((err) => {
                console.error("Failed to send expired credential notification:", err);
              });

              // Create audit log entry for activity feed
              await prisma.auditLog.create({
                data: {
                  companyId: company.id,
                  userId: credential.caregiverProfile.user.id,
                  action: "CREDENTIAL_EXPIRED",
                  entityType: "CaregiverCredential",
                  entityId: credential.id,
                  changes: {
                    credentialType: credential.credentialType.name,
                    expirationDate: credential.expirationDate.toISOString(),
                    severity: "CRITICAL",
                  },
                },
              });
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Company ${company.name}: ${errorMessage}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Error in credential check cron:", error);
    return NextResponse.json(
      { error: "Failed to check credentials", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper functions
function getSeverityForDays(days: number): string {
  if (days < 0) return "CRITICAL";
  if (days <= 7) return "HIGH";
  if (days <= 30) return "WARNING";
  return "INFO";
}

function getAlertTypeForDays(days: number): string {
  if (days < 0) return "EXPIRED";
  if (days <= 7) return "EXPIRING_7_DAYS";
  if (days <= 30) return "EXPIRING_30_DAYS";
  if (days <= 60) return "EXPIRING_60_DAYS";
  return "EXPIRING_SOON";
}

function getMessageForDays(days: number, credentialName: string, caregiverName: string): string {
  if (days < 0) {
    return `${credentialName} for ${caregiverName} has expired`;
  }
  if (days === 0) {
    return `${credentialName} for ${caregiverName} expires today`;
  }
  if (days === 1) {
    return `${credentialName} for ${caregiverName} expires tomorrow`;
  }
  return `${credentialName} for ${caregiverName} expires in ${days} days`;
}

function getNotificationEventType(days: number): NotificationEventType | null {
  if (days < 0) return "CREDENTIAL_EXPIRED";
  if (days <= 7) return "CREDENTIAL_EXPIRING_7_DAYS";
  if (days <= 30) return "CREDENTIAL_EXPIRING_30_DAYS";
  if (days <= 60) return "CREDENTIAL_EXPIRING_60_DAYS";
  return null; // No notification for more than 60 days
}
