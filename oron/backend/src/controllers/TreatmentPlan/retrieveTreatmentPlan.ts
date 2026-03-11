import { Request, Response, NextFunction } from 'express';
import { getRepository, In } from 'typeorm';
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

export const retrieveTreatmentPlan = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const fullPlanRepository = await getRepository(TreatmentFullPlan);
    const treatmentGoalRepository = await getRepository(TreatmentGoal);
    const basicInformationRepository = await getRepository(TreatmentBasicInformation);
    const treatmentScheduleRepository = await getRepository(TreatmentSchedule);
    const treatmentGoalSignatureRepository = await getRepository(TreatmentGoalSignature);
    const treatmentPlanDocumentRepository = await getRepository(TreatmentPlanDocuments);
    const intake_full_id = req.params.intake_full_id;
    let treatmentPlans = [];
    let treatmentData = {};

    if (!intake_full_id) {
      const customError = new CustomError(400, 'Raw', 'Intake Full ID is required', null, null);
      return next(customError);
    }

    let treatment_type = req.query.treatment_type;

    treatment_type = treatment_type ?? 'IISS_Assessment';

    const fullPlans = await fullPlanRepository.find({
      where: {
        intake_full_id,
        treatment_plan_type: treatment_type,
        deleted_at: null,
      },
      order: { created_at: 'DESC' },
    });

    for (const fullPlan of fullPlans) {
      const basicInformation = await basicInformationRepository.findOne({
        where: {
          id: fullPlan.basic_information_id,
          intake_full_id,
          treatment_plan_type: treatment_type,
          deleted_at: null,
        },
        order: { created_at: 'DESC' },
      });

      const treatmentGoalIds = fullPlan.treatment_goal_ids || [];
      const treatmentGoals = await treatmentGoalRepository.find({
        where: {
          intake_full_id,
          // treatment_plan_type: treatment_type,
          deleted_at: null,
          id: In(treatmentGoalIds),
        },
        order: { created_at: 'DESC' },
      });

      const treatmentSchedule = await treatmentScheduleRepository.find({
        where: { intake_full_id, treatment_plan_type: treatment_type, deleted_at: null },
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

      const treatmentDocuments = await treatmentPlanDocumentRepository.find({
        where: { intake_full_id, treatment_plan_type: treatment_type, deleted_at: null },
        order: { created_at: 'DESC' },
      });

      treatmentData = {
        ...fullPlan,
        treatmentGoal: treatmentGoals,
        basicInformation,
        treatmentSchedule,
        treatmentGoalSignature,
        treatmentDocuments,
      };

      treatmentPlans.push(treatmentData);
    }

    return res.customSuccess(200, 'Treatment plans successfully retrieved.', { treatmentPlans });

    //return res.customSuccess(200, 'Treatment plan successfully retrieved.', treatmentData);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Retrieving Treatment plan Information', null, err);
    return next(customError);
  }
};
