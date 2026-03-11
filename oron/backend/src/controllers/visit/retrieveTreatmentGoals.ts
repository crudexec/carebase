import { Request, Response, NextFunction } from 'express';
import { getRepository, In } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { TreatmentGoal } from 'orm/entities/TreatmentPlan/treatmentGoal';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveTreatmentGoalsForVisitLog = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  try {
    const treatmentGoalRepository = await getRepository(TreatmentGoal);
    const treatmentPlanRepository = await getRepository(TreatmentFullPlan);
    const intakeRepository = await getRepository(IntakeFullForm);
    const intake_full_id = req.params.intake_full_id;
    const treatment_plan_type = req.query.treatment_plan_type;

    const activeTreatmentPlan = await treatmentPlanRepository.findOne({
      where: {
        intake_full_id,
        treatment_plan_type,
        active_treatment: true,
        deleted_at: null,
      },
    });

    const intakeExists = await intakeRepository.findOne({
      where: { id: intake_full_id, deleted_at: null },
    });

    if (!intakeExists) {
      const customError = new CustomError(404, 'General', `Intake Form not found`, ['Intake Form not found.']);
      return next(customError);
    }

    if (!activeTreatmentPlan) {
      return res.customSuccess(200, 'No active treatment plan found.', []);
    }

    const treatmentGoals = await treatmentGoalRepository.find({
      where: {
        intake_full_id,
        treatment_plan_type,
        id: In(activeTreatmentPlan.treatment_goal_ids),
        deleted_at: null,
      },
      order: { created_at: 'DESC' },
    });

    return res.customSuccess(200, 'Treatment Goal Information successfully retrieved.', treatmentGoals);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Retrieving Treatment Goal Information', null, err);
    return next(customError);
  }
};
