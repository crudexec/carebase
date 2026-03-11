import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TreatmentPlanDocuments } from 'orm/entities/TreatmentPlan/documentPlan';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveTreatmentPlanDocuments = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const intake_full_id = req.params.intake_full_id;
    if (!intake_full_id) {
      const customError = new CustomError(400, 'Raw', 'Intake Full ID is required', null, null);
      return next(customError);
    }

    const documentRepository = await getRepository(TreatmentPlanDocuments);

    const documents = await documentRepository.find({ intake_full_id, deleted_at: null });

    return res.customSuccess(200, 'Documents retrieved.', { documents });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Retrieving Treatment plan Information', null, err);
    return next(customError);
  }
};
