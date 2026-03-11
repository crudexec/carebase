import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { User } from 'orm/entities/User';
import { FcVisitFullForm } from 'orm/entities/FCVisitLog/fcVisitFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveAllVisitLogs = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const intake_full_id = req.params.intake_full_id;
    const visitFullFormRepository = getRepository(FcVisitFullForm);
    const userRepository = getRepository(User);
    const visitDump = [];

    const visitFullForm = await visitFullFormRepository.find({
      where: { intake_full_id, deleted_at: null },
      order: { created_at: 'DESC' },
    });

    for (const visit of visitFullForm) {
      const user = await userRepository.findOne({ where: { id: visit.registered_by, deleted_at: null } });
      visit['staff'] = user;
      visitDump.push(visit);
    }

    return res.customSuccess(200, 'Visit Forms successfully retrieved.', visitDump);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error retrieving visit logs', null, err);
    return next(customError);
  }
};
