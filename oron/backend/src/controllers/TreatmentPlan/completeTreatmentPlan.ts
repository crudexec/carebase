import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const completeTreatmentPlan = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const { treatment_full_id } = req.body;
    const fullPlanRepository = await getRepository(TreatmentFullPlan);

    const fullPlan = await fullPlanRepository.findOne({
      where: { id: treatment_full_id, deleted_at: null },
    });

    if (!fullPlan) {
      const customError = new CustomError(404, 'General', 'Treatment Plan Not Found', ['Treatment Plan not found']);
      return next(customError);
    }

    await fullPlanRepository.update({ id: treatment_full_id }, { status: Status.NOT_SENT });

    return res.customSuccess(200, 'Treatment plan successfully completed', null);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Completing Treatment Plan', null, err);
    return next(customError);
  }
};
