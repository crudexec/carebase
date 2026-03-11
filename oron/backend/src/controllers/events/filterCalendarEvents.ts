import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Events } from 'orm/entities/Events/events';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const filterCalendarEventsSchedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const account_id = req.user.account_id;

    const eventRepository = getRepository(Events);

    const { employee_or_staff_name, client_name } = req.body;

    const events = await eventRepository
      .createQueryBuilder('events')
      .orderBy('created_at', 'DESC')
      .where('LOWER(events.employee_or_staff_name) LIKE LOWER(:employee_or_staff_name)', {
        employee_or_staff_name: `%${employee_or_staff_name}%`,
      })
      .andWhere('LOWER(events.client_name) LIKE LOWER(:client_name)', { client_name: `%${client_name}%` })
      .andWhere({ account_id, deleted_at: null })
      .getMany();

    return res.customSuccess(200, 'Events Retrieved Successfully', events);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Retrieving Event', null, err);
    return next(customError);
  }
};
