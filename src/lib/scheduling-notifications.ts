import { format } from "date-fns";
import { sendNotification } from "@/lib/notifications";

type ShiftAssignmentNotificationInput = {
  shiftId: string;
  carerId: string;
  client: {
    firstName: string;
    lastName: string;
    address?: string | null;
  };
  scheduledStart: Date;
  scheduledEnd: Date;
};

export function sendShiftAssignmentNotification({
  shiftId,
  carerId,
  client,
  scheduledStart,
  scheduledEnd,
}: ShiftAssignmentNotificationInput) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.carebasehealth.com";

  return sendNotification({
    eventType: "SHIFT_ASSIGNED",
    recipientIds: [carerId],
    data: {
      clientName: `${client.firstName} ${client.lastName}`,
      shiftDate: format(scheduledStart, "EEEE, MMMM d, yyyy"),
      shiftTime: format(scheduledStart, "h:mm a"),
      shiftEndTime: format(scheduledEnd, "h:mm a"),
      address: client.address || "Address not provided",
      shiftUrl: `${appUrl}/scheduling?shift=${shiftId}`,
    },
    relatedEntityType: "Shift",
    relatedEntityId: shiftId,
  });
}
