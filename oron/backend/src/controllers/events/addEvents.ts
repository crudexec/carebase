import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Events } from 'orm/entities/Events/events';
import { ClientInformation } from 'orm/entities/IntakeForm/clientInformation';
import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { User } from 'orm/entities/User';
import { IntakeFormStatus } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { sendCalendarEventReceipt } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addEventSchedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const eventRepository = getRepository(Events);
    const userRepository = getRepository(User);
    const intakeFullFormRepository = getRepository(IntakeFullForm);
    const clientInformationRepository = getRepository(ClientInformation);
    const user_id = req.user.id;
    const account_id = req.user.account_id;
    const {
      client_intake_id,
      client_name,
      employee_or_staff_name,
      employee_or_staff_id,
      event_date,
      start_time,
      end_time,
      notes,
      should_repeat,
    } = req.body;

    const alreadyScheduledEvents = await eventRepository.find({
      where: {
        employee_or_staff_id,
        deleted_at: null,
      },
    });

    if (alreadyScheduledEvents.length > 0) {
      for (const schedule of alreadyScheduledEvents) {
        const oldDate = new Date(schedule.event_date).setHours(0, 0, 0, 0);
        const newDate = new Date(event_date).setHours(0, 0, 0, 0);
        const newTimeSlot = start_time.split(':');
        const oldTimeSlot = schedule.start_time.split(':');
        const oldTimeSlotEnd = schedule.end_time.split(':');

        const startTimeHourSlot = newTimeSlot[0];
        const startTimeMinuteSlot = String(newTimeSlot[1]).replace(/[a-zA-Z]/g, '');
        const formerStartTimeHourSlot = oldTimeSlot[0];
        const formerStartTimeMinuteSlot = oldTimeSlot[1].replace(/[a-zA-Z]/g, '');

        const formerEndTimeHourSlot = oldTimeSlotEnd[0];
        const formerEndTimeMinuteSlot = oldTimeSlotEnd[1].replace(/[a-zA-Z]/g, '');

        const parsedOldDate = new Date(oldDate);
        const parsedNewDate = new Date(newDate);

        const oldSlot = new Date(
          Date.UTC(parsedOldDate.getUTCFullYear(), parsedOldDate.getUTCMonth(), parsedOldDate.getUTCDate()),
        );
        const oldSlotEnd = new Date(
          Date.UTC(parsedOldDate.getUTCFullYear(), parsedOldDate.getUTCMonth(), parsedOldDate.getUTCDate()),
        );
        const newSlot = new Date(
          Date.UTC(parsedNewDate.getUTCFullYear(), parsedNewDate.getUTCMonth(), parsedNewDate.getUTCDate()),
        );

        if (oldDate === newDate) {
          if (newTimeSlot[1].includes('pm') || oldTimeSlot[1].includes('pm')) {
            oldSlot.setUTCHours(startTimeHourSlot + 12, Number(startTimeMinuteSlot), 0, 0);
            newSlot.setUTCHours(Number(formerStartTimeHourSlot) + 12, Number(formerStartTimeMinuteSlot), 0, 0);
            oldSlotEnd.setUTCHours(Number(formerEndTimeHourSlot) + 12, Number(formerEndTimeMinuteSlot), 0, 0);
          } else {
            oldSlot.setUTCHours(startTimeHourSlot, Number(startTimeMinuteSlot), 0, 0);
            newSlot.setUTCHours(Number(formerStartTimeHourSlot), Number(formerStartTimeMinuteSlot), 0, 0);
            oldSlotEnd.setUTCHours(Number(formerEndTimeHourSlot), Number(formerEndTimeMinuteSlot), 0, 0);
          }
          if (
            oldSlot.getTime() === newSlot.getTime() ||
            (oldSlot.getTime() > newSlot.getTime() && oldSlot.getTime() < oldSlotEnd.getTime())
          ) {
            const customError = new CustomError(404, 'General', `Event already scheduled for this date and time slot`, [
              'Event already scheduled for this date',
            ]);
            return next(customError);
          }
        }
      }
    }

    const event = new Events();

    event.client_intake_id = client_intake_id;
    event.client_name = client_name;
    event.employee_or_staff_name = employee_or_staff_name;
    event.event_date = event_date;
    event.start_time = start_time;
    event.end_time = end_time;
    event.notes = notes;
    event.should_repeat = should_repeat;
    event.scheduled_by = user_id;
    event.employee_or_staff_id = employee_or_staff_id;
    event.account_id = account_id;

    const savedEvent = await eventRepository.save(event);

    const user = await userRepository.findOne({ where: { id: savedEvent.employee_or_staff_id, deleted_at: null } });

    const userFullName = user.first_name + ' ' + user.last_name;
    const intakeData = await intakeFullFormRepository.findOne({
      where: { id: savedEvent.client_intake_id, deleted_at: null },
    });

    const clientInformation = await clientInformationRepository.findOne({
      where: { id: intakeData.client_information_id, deleted_at: null },
    });

    const dateFormat = new Date(savedEvent.event_date).toDateString();
    await sendCalendarEventReceipt(
      userFullName,
      savedEvent.notes,
      intakeData?.first_name + ' ' + intakeData?.last_name,
      dateFormat + ' , ' + savedEvent.start_time,
      clientInformation?.address_or_street,
      user.email,
    );

    await intakeFullFormRepository.update({ id: savedEvent?.client_intake_id }, { status: IntakeFormStatus.Active });
    return res.customSuccess(200, 'Event Scheduled Successfully', savedEvent);
  } catch (err) {
    console.log('err--->', err);
    const customError = new CustomError(400, 'Raw', 'Error Scheduling Event', null, err);
    return next(customError);
  }
};
