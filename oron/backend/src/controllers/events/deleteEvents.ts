import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Events } from 'orm/entities/Events/events';
import { RescheduledEventLog } from 'orm/entities/Events/rescheduledEventLogs';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const deleteEventSchedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const eventRepository = getRepository(Events);
    const rescheduledEventLogRepository = getRepository(RescheduledEventLog);
    const { event_schedule_id } = req.body;
    const eventExists = await eventRepository.findOne({ where: { id: event_schedule_id, deleted_at: null } });

    if (!eventExists) {
      const customError = new CustomError(404, 'General', `Event not found`, ['Event not found.']);
      return next(customError);
    }

    await eventRepository.softDelete(event_schedule_id);
    await rescheduledEventLogRepository.softDelete({ former_event_id: event_schedule_id });

    return res.customSuccess(200, 'Event schedule successfully deleted', null);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Deleting Event', null, err);
    return next(customError);
  }
};
