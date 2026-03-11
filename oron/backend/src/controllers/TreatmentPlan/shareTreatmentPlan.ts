import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { TreatmentBasicInformation } from 'orm/entities/TreatmentPlan/basicInformation';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { SharedTreatmentPlan } from 'orm/entities/TreatmentPlan/sharedTreatmentPlan';
import { JwtPayload } from 'types/JwtPayload';
import { sendSharedTreatmentPlan } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const shareTreatmentPlan = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const { recipient_name, recipient_email, recipient_role, treatment_full_id, intake_full_id, treatment_plan_type } =
      req.body;
    const treatmentFullPlanRepository = getRepository(TreatmentFullPlan);
    const treatmentBasicInformationRepository = getRepository(TreatmentBasicInformation);
    const sharedTreatmentPlanRepository = getRepository(SharedTreatmentPlan);

    const treatmentPlan = await treatmentFullPlanRepository.findOne({
      where: { id: treatment_full_id, deleted_at: null },
      order: { created_at: 'DESC' },
    });

    const basicInformation = await treatmentBasicInformationRepository.findOne({
      where: { intake_full_id, deleted_at: null },
    });

    if (!treatmentPlan) {
      const customError = new CustomError(404, 'General', `Treatment Plan not found`, ['Treatment Plan not found.']);
      return next(customError);
    }

    if (!basicInformation) {
      const customError = new CustomError(404, 'General', `Basic Information not found`, [
        'Basic Information not found.',
      ]);
      return next(customError);
    }

    const invitationLink = `${process.env.FRONTEND_URL}/preview-treatment-plan/${treatmentPlan.id}?treatment_plan_type=${treatment_plan_type}`;

    await sendSharedTreatmentPlan(
      recipient_name,
      basicInformation.participant_first_name,
      invitationLink,
      recipient_email,
    );

    const sharedTreatmentPlan = new SharedTreatmentPlan();

    sharedTreatmentPlan.recipient_name = recipient_name;
    sharedTreatmentPlan.recipient_email = recipient_email;
    sharedTreatmentPlan.recipient_role_or_position = recipient_role;
    sharedTreatmentPlan.intake_full_id = intake_full_id;
    sharedTreatmentPlan.treatment_full_id = treatment_full_id;

    await sharedTreatmentPlanRepository.save(sharedTreatmentPlan);

    return res.customSuccess(200, 'Treatment Plan successfully shared', treatmentPlan);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error sharing treatment plan', null, err);
    return next(customError);
  }
};
