import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TreatmentBasicInformation } from 'orm/entities/TreatmentPlan/basicInformation';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { TreatmentGoalSignature } from 'orm/entities/TreatmentPlan/treatmentGoalSignature';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { sendParentSignatureConfirmation, sendAdminParentSignatureConfirmation } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const signParentTreatmentPlan = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let { treatment_full_id, parent_signature_url, treatment_plan_type } = req.body;
    const treatmentPlanSignatureRepository = getRepository(TreatmentGoalSignature);
    const treatmentFullPlanRepository = getRepository(TreatmentFullPlan);
    const treatmentBasicInformationRepository = getRepository(TreatmentBasicInformation);
    const userRepository = getRepository(User);

    treatment_plan_type = treatment_plan_type ?? 'IISS_Assessment';

    const treatmentPlan = await treatmentFullPlanRepository.findOne({
      where: { id: treatment_full_id, deleted_at: null },
    });

    if (!treatmentPlan) {
      const customError = new CustomError(404, 'General', `Treatment Plan not found`, ['Treatment Plan not found.']);
      return next(customError);
    }

    const signedTreatmentPlan = await treatmentPlanSignatureRepository.findOne({
      where: { treatment_full_id, deleted_at: null },
    });

    if (!signedTreatmentPlan) {
      const customError = new CustomError(404, 'General', `Treatment Plan not signed by admin`, [
        'Treatment Plan not signed by admin.',
      ]);
      return next(customError);
    }

    const basicInformation = await treatmentBasicInformationRepository.findOne({
      where: { intake_full_id: treatmentPlan.intake_full_id, deleted_at: null },
    });

    parent_signature_url = parent_signature_url ?? signedTreatmentPlan.parent_signature_url;

    signedTreatmentPlan.parent_signature_url = parent_signature_url;
    signedTreatmentPlan.parent_signed = true;
    signedTreatmentPlan.date_parent_signed = new Date();

    treatmentPlan.status = Status.SIGNED;

    await treatmentFullPlanRepository.update({ id: treatmentPlan.id }, treatmentPlan);

    await treatmentPlanSignatureRepository.update({ id: signedTreatmentPlan.id }, signedTreatmentPlan);

    const treatmentSignature = await treatmentPlanSignatureRepository.findOne({
      where: { treatment_full_id, parent_signed: true, deleted_at: null },
    });

    const invitationLink = `${process.env.FRONTEND_URL}/admin/clients/${treatmentPlan.intake_full_id}`;
    const parentInvitationLink = `${process.env.FRONTEND_URL}/sign-treatment-plan/${treatmentPlan.id}/?treatment_plan_type=${treatment_plan_type}`;

    const user = await userRepository.findOne({
      where: { id: treatmentPlan.registered_by, deleted_at: null },
    });

    await sendParentSignatureConfirmation(
      treatmentPlan.parent_name,
      basicInformation.participant_first_name,
      parentInvitationLink,
      treatmentPlan.parent_email,
    );

    await sendAdminParentSignatureConfirmation(
      treatmentPlan.parent_name,
      basicInformation.participant_first_name,
      invitationLink,
      new Date(signedTreatmentPlan.date_parent_signed).toDateString(),
      user.email,
    );

    return res.customSuccess(200, 'Treatment Plan successfully signed by admin', treatmentSignature);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error signing treatment plan', null, err);
    return next(customError);
  }
};
