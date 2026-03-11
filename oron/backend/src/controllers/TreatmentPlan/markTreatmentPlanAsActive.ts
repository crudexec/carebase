import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { TreatmentBasicInformation } from 'orm/entities/TreatmentPlan/basicInformation';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { TreatmentGoal } from 'orm/entities/TreatmentPlan/treatmentGoal';
import { TreatmentGoalSignature } from 'orm/entities/TreatmentPlan/treatmentGoalSignature';
import { TreatmentSchedule } from 'orm/entities/TreatmentPlan/treatmentSchedule';
import { TreatmentPlanDocuments } from 'orm/entities/TreatmentPlan/documentPlan';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const markTreatmentPlanAsActive = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const fullPlanRepository = await getRepository(TreatmentFullPlan);

    const { treatment_plan_id, intake_full_id, treatment_plan_type } = req.body;

    if (!treatment_plan_id) {
      const customError = new CustomError(400, 'Raw', 'Treatment Plan ID is required', null, null);
      return next(customError);
    }

    const treatmentPlan = await fullPlanRepository.findOne({
      where: {
        id: treatment_plan_id,
        deleted_at: null,
      },
    });

    // Fetch all treatment plans for the intake and make them inactive
    await fullPlanRepository.update(
      { intake_full_id, treatment_plan_type, deleted_at: null },
      { active_treatment: false },
    );

    if (!treatmentPlan) {
      const customError = new CustomError(400, 'Raw', 'Treatment Plan not found', null, null);
      return next(customError);
    }

    await fullPlanRepository.update(treatment_plan_id, {
      active_treatment: true,
    });

    return res.status(200).json({
      message: 'Treatment Plan marked as active successfully',
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Marking Treatment plan as active', null, err);
    return next(customError);
  }
};
