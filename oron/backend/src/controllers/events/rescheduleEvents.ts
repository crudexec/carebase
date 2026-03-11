import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Events } from 'orm/entities/Events/events';
import { RescheduledEventLog } from 'orm/entities/Events/rescheduledEventLogs';
import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { User } from 'orm/entities/User';
import { JwtPayload } from 'types/JwtPayload';
import { sendRescheduleEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const rescheduleEventSchedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const eventRepository = getRepository(Events);
    const rescheduledEventLogRepository = getRepository(RescheduledEventLog);
    const intakeFullFormRepository = getRepository(IntakeFullForm);
    const userRepository = getRepository(User);
    const user_id = req.user.id;
    const account_id = req.user.account_id;
    const { event_schedule_id, new_rescheduled_event_date, start_time, end_time, reason_for_rescheduling } = req.body;
    const rescheduledEventLog = new RescheduledEventLog();

    const eventExists = await eventRepository.findOne({ where: { id: event_schedule_id, deleted_at: null } });

    if (!eventExists) {
      const customError = new CustomError(404, 'General', `Event not found`, ['Event not found.']);
      return next(customError);
    }

    const intakeData = await intakeFullFormRepository.findOne({
      where: { id: eventExists.client_intake_id, deleted_at: null },
    });

    //const userData = await userRepository.findOne({ where: { id: user_id, deleted_at: null } });

    const adminData = await userRepository.findOne({ where: { id: eventExists.scheduled_by, deleted_at: null } });

    rescheduledEventLog.account_id = account_id;
    rescheduledEventLog.rescheduled_by = user_id;
    rescheduledEventLog.new_rescheduled_event_date = new_rescheduled_event_date;
    rescheduledEventLog.reason_for_rescheduling = reason_for_rescheduling;
    rescheduledEventLog.former_event_id = eventExists.id;
    rescheduledEventLog.start_time = start_time;
    rescheduledEventLog.end_time = end_time;

    await eventRepository.update(
      { id: eventExists.id },
      {
        was_rescheduled: true,
      },
    );

    const formerDate = eventExists.start_time;

    await rescheduledEventLogRepository.save(rescheduledEventLog);

    const formerDateFormat = new Date(eventExists.event_date).toDateString();
    const newDateFormat = new Date(new_rescheduled_event_date).toDateString();
    const clientName = intakeData.first_name + ' ' + intakeData.last_name;
    await sendRescheduleEmail(
      eventExists.employee_or_staff_name,
      eventExists.declination_reason,
      clientName,
      `${formerDateFormat} ${formerDate}`,
      `${newDateFormat} ${start_time} `,
      adminData.email,
    );

    return res.customSuccess(200, 'Event rescheduled successfully', eventExists);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Scheduling Event', null, err);
    return next(customError);
  }
};
