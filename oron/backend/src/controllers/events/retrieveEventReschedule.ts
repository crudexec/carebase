import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { RescheduledEventLog } from 'orm/entities/Events/rescheduledEventLogs';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveEventsReSchedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const account_id = req.user.account_id;

    const rescheduledEventLogRepository = getRepository(RescheduledEventLog);

    const rescheduledEvents = await rescheduledEventLogRepository.find({
      where: { account_id, deleted_at: null },
      relations: ['events'],
    });

    return res.customSuccess(200, 'Events Retrieved Successfully', rescheduledEvents);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Retrieving Event', null, err);
    return next(customError);
  }
};
