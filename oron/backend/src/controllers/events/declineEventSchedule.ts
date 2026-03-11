import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Events } from 'orm/entities/Events/events';
import { RescheduledEventLog } from 'orm/entities/Events/rescheduledEventLogs';
import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { User } from 'orm/entities/User';
import { JwtPayload } from 'types/JwtPayload';
import { sendRescheduleEventDeclination } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const declineEventSchedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const eventRepository = getRepository(Events);
    const rescheduledEventLogRepository = getRepository(RescheduledEventLog);
    const userRepository = getRepository(User);
    const intakeFullFormRepository = getRepository(IntakeFullForm);
    const { declination_reason, event_schedule_id } = req.body;

    const event = new Events();

    const eventExists = await eventRepository.findOne({ where: { id: event_schedule_id, deleted_at: null } });

    if (!eventExists) {
      const customError = new CustomError(404, 'General', `Event not found`, ['Event not found.']);
      return next(customError);
    }

    eventExists.declination_date = new Date();
    eventExists.declination_reason = declination_reason;

    const userData = await userRepository.findOne({
      where: { id: eventExists.employee_or_staff_id, deleted_at: null },
    });
    const intakeData = await intakeFullFormRepository.findOne({
      where: { id: eventExists.client_intake_id, deleted_at: null },
    });
    const formerDateFormat = `${new Date(eventExists.event_date).toDateString() + ' ' + eventExists.start_time}`;
    const clientName = intakeData.first_name + ' ' + intakeData.last_name;

    await eventRepository.update({ id: event_schedule_id }, eventExists);

    await rescheduledEventLogRepository.softDelete({ former_event_id: event_schedule_id });

    await sendRescheduleEventDeclination(
      eventExists.employee_or_staff_name,
      clientName,
      formerDateFormat,
      declination_reason,
      userData.email,
    );

    return res.customSuccess(200, 'Event rescheduled successfully declined', event);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Scheduling Event', null, err);
    return next(customError);
  }
};
