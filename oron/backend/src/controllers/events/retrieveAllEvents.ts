import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Events } from 'orm/entities/Events/events';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveAllEventsSchedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const account_id = req.user.account_id;

    const eventRepository = getRepository(Events);

    const events = await eventRepository.find({ where: { account_id, deleted_at: null } });

    return res.customSuccess(200, 'Events Retrieved Successfully', events);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Retrieving Event', null, err);
    return next(customError);
  }
};
