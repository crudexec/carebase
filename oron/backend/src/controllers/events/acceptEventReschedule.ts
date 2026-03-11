import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Events } from 'orm/entities/Events/events';
import { RescheduledEventLog } from 'orm/entities/Events/rescheduledEventLogs';
import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { User } from 'orm/entities/User';
import { JwtPayload } from 'types/JwtPayload';
import { sendRescheduleEventApproval } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const acceptEventReschedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const eventRepository = getRepository(Events);
    const rescheduledEventLogRepository = getRepository(RescheduledEventLog);
    const userRepository = getRepository(User);
    const intakeFullFormRepository = getRepository(IntakeFullForm);
    const { event_schedule_id } = req.body;

    const event = new Events();

    const eventExists = await eventRepository.findOne({ where: { id: event_schedule_id, deleted_at: null } });

    if (!eventExists) {
      const customError = new CustomError(404, 'General', `Event not found`, ['Event not found.']);
      return next(customError);
    }

    const rescheduledEventLog = await rescheduledEventLogRepository.findOne({
      where: { former_event_id: event_schedule_id },
    });

    const userData = await userRepository.findOne({
      where: { id: eventExists.employee_or_staff_id, deleted_at: null },
    });
    const intakeData = await intakeFullFormRepository.findOne({
      where: { id: eventExists.client_intake_id, deleted_at: null },
    });
    const formerDateFormat = new Date(eventExists.event_date).toDateString();
    const newDateFormat = new Date(rescheduledEventLog.new_rescheduled_event_date).toDateString();
    const clientName = intakeData.first_name + ' ' + intakeData.last_name;

    eventExists.event_date = rescheduledEventLog.new_rescheduled_event_date;
    eventExists.start_time = rescheduledEventLog.start_time;
    eventExists.end_time = rescheduledEventLog.end_time;
    eventExists.event_approved = true;
    eventExists.was_rescheduled = true;

    await eventRepository.update({ id: event_schedule_id }, eventExists);

    await rescheduledEventLogRepository.update({ former_event_id: event_schedule_id }, { reschedule_approved: true });

    await rescheduledEventLogRepository.softDelete({ former_event_id: event_schedule_id });

    await sendRescheduleEventApproval(
      eventExists.employee_or_staff_name,
      clientName,
      formerDateFormat,
      newDateFormat,
      userData.email,
    );
    return res.customSuccess(200, 'Event reschedule accepted', event);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Scheduling Event', null, err);
    return next(customError);
  }
};
