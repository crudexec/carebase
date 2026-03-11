import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { User } from 'orm/entities/User';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { TreatmentPlanType } from 'types/genericEnums';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveAllVisitLogs = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const intake_full_id = req.params.intake_full_id;
    const visitFullFormRepository = getRepository(VisitFullForm);
    const userRepository = getRepository(User);
    const visitDump = [];
    const treatment_type = req.query.treatment_type ?? TreatmentPlanType.IISS_ASSESSMENT;

    const visitFullForm = await visitFullFormRepository.find({
      where: { intake_full_id, treatment_type, deleted_at: null },
      order: { created_at: 'DESC' },
    });

    if (visitFullForm.length > 0) {
      for (const visit of visitFullForm) {
        const user = await userRepository.findOne({ where: { id: visit.registered_by, deleted_at: null } });
        visit['staff'] = user;
        visitDump.push(visit);
      }
    }

    return res.customSuccess(200, 'Visit Forms successfully retrieved.', visitDump);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error retrieving visit logs', null, err);
    return next(customError);
  }
};
