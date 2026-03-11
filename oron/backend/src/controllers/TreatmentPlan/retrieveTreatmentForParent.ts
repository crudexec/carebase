import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TreatmentBasicInformation } from 'orm/entities/TreatmentPlan/basicInformation';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { TreatmentGoal } from 'orm/entities/TreatmentPlan/treatmentGoal';
import { TreatmentGoalSignature } from 'orm/entities/TreatmentPlan/treatmentGoalSignature';
import { TreatmentSchedule } from 'orm/entities/TreatmentPlan/treatmentSchedule';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveTreatmentPlanForParent = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const fullPlanRepository = await getRepository(TreatmentFullPlan);
    const treatmentGoalRepository = await getRepository(TreatmentGoal);
    const basicInformationRepository = await getRepository(TreatmentBasicInformation);
    const treatmentScheduleRepository = await getRepository(TreatmentSchedule);
    const treatmentGoalSignatureRepository = await getRepository(TreatmentGoalSignature);
    const treatment_plan_type = req.query.treatment_type;
    // const intake_full_id = req.params.intake_full_id;
    const treatment_full_id = req.params.treatment_full_id;
    let treatmentData = {};
    let treatment_type = req.query.treatment_type;

    treatment_type = treatment_type ?? 'IISS_Assessment';

    const fullPlan = await fullPlanRepository.findOne({
      where: { id: treatment_full_id, treatment_plan_type, deleted_at: null },
      order: { created_at: 'DESC' },
    });

    const basicInformation = await basicInformationRepository.findOne({
      where: { intake_full_id: fullPlan.intake_full_id, treatment_plan_type, deleted_at: null },
      order: { created_at: 'DESC' },
    });

    const treatmentGoals = await treatmentGoalRepository.find({
      where: { intake_full_id: fullPlan.intake_full_id, treatment_plan_type, deleted_at: null },
      order: { created_at: 'DESC' },
    });

    const treatmentSchedule = await treatmentScheduleRepository.find({
      where: { intake_full_id: fullPlan.intake_full_id, treatment_plan_type, deleted_at: null },
      order: { created_at: 'DESC' },
    });

    const treatmentGoalSignature =
      (await treatmentGoalSignatureRepository.findOne({
        where: {
          intake_full_id: fullPlan.intake_full_id,
          treatment_plan_type: treatment_type,
          parent_signed: true,
          deleted_at: null,
        },
        order: { created_at: 'DESC' },
      })) ??
      (await treatmentGoalSignatureRepository.findOne({
        where: {
          intake_full_id: fullPlan.intake_full_id,
          treatment_plan_type: treatment_type,
          deleted_at: null,
        },
        order: { created_at: 'DESC' },
      }));

    treatmentData = {
      ...fullPlan,
      treatmentGoal: treatmentGoals,
      basicInformation,
      treatmentSchedule,
      treatmentGoalSignature,
    };

    return res.customSuccess(200, 'Treatment Schedule Information successfully retrieved.', treatmentData);
  } catch (err) {
    const customError = new CustomError(
      400,
      'Raw',
      'Network Error Retrieving Treatment Schedule Information',
      null,
      err,
    );
    return next(customError);
  }
};
