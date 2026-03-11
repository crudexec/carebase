import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TreatmentBasicInformation } from 'orm/entities/TreatmentPlan/basicInformation';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { TreatmentGoalSignature } from 'orm/entities/TreatmentPlan/treatmentGoalSignature';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { sendRequestParentSignature } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const sendParentTreatmentPlan = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const {
      parent_name,
      parent_email,
      relation_to_participant,
      treatment_full_id,
      intake_full_id,
      treatment_plan_type,
    } = req.body;
    const treatmentFullPlanRepository = getRepository(TreatmentFullPlan);
    const treatmentBasicInformationRepository = getRepository(TreatmentBasicInformation);

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

    treatmentPlan.parent_email = parent_email;
    treatmentPlan.relation_to_participant = relation_to_participant;
    treatmentPlan.parent_name = parent_name;
    treatmentPlan.parent_email_sent = true;
    treatmentPlan.status = Status.AWAITING_SIGNATURE;

    const invitationLink = `${process.env.FRONTEND_URL}/sign-treatment-plan/${treatmentPlan.id}/?treatment_plan_type=${treatment_plan_type}`;
    await treatmentFullPlanRepository.update(treatmentPlan.id, treatmentPlan);

    await sendRequestParentSignature(
      parent_name,
      basicInformation.participant_first_name,
      invitationLink,
      parent_email,
    );
    treatmentPlan.parent_email_sent = true;

    await treatmentFullPlanRepository.update(treatmentPlan.id, treatmentPlan);

    return res.customSuccess(200, 'Treatment Plan successfully requested from parent.', treatmentPlan);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error requesting for parent signature', null, err);
    return next(customError);
  }
};
