import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Events } from 'orm/entities/Events/events';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editEventSchedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const eventRepository = getRepository(Events);
    const {
      event_schedule_id,
      event_date,
      start_time,
      end_time,
      notes,
      client_name,
      employee_or_staff_name,
      employee_or_staff_id,
      should_repeat,
    } = req.body;

    const eventExists = await eventRepository.findOne({ where: { id: event_schedule_id, deleted_at: null } });

    if (!eventExists) {
      const customError = new CustomError(404, 'General', `Event not found`, ['Event not found.']);
      return next(customError);
    }

    eventExists.event_date = event_date;
    eventExists.start_time = start_time;
    eventExists.end_time = end_time;
    eventExists.notes = notes;
    eventExists.client_name = client_name;
    eventExists.employee_or_staff_name = employee_or_staff_name;
    eventExists.employee_or_staff_id = employee_or_staff_id;
    eventExists.should_repeat = should_repeat;

    await eventRepository.update({ id: event_schedule_id }, eventExists);

    return res.customSuccess(200, 'Event successfully edited ', eventExists);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Editing scheduled event', null, err);
    return next(customError);
  }
};
