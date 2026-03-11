import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const deleteTreatmentPlan = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const { treatment_plan_id } = req.body;

    const treatmentFullPlanRepository = getRepository(TreatmentFullPlan);

    if (!treatment_plan_id) {
      const customError = new CustomError(400, 'Raw', 'Treatment Plan ID is required', null, null);
      return next(customError);
    }

    const treatmentPlan = await treatmentFullPlanRepository.findOne({
      where: {
        id: treatment_plan_id,
        deleted_at: null,
      },
    });

    if (!treatmentPlan) {
      const customError = new CustomError(400, 'Raw', 'Treatment Plan not found', null, null);
      return next(customError);
    }

    await treatmentFullPlanRepository.softDelete(treatment_plan_id);

    return res.status(200).json({
      message: 'Treatment Plan deleted successfully',
    });
  } catch (error) {
    const customError = new CustomError(500, 'Raw', 'Error deleting treatment plan', null, null);
    return next(customError);
  }
};
