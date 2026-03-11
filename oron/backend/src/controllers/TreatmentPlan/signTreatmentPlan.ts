import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { TreatmentGoalSignature } from 'orm/entities/TreatmentPlan/treatmentGoalSignature';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const signTreatmentPlan = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const { full_name, treatment_full_id, intake_full_id, signature_url, treatment_plan_type } = req.body;
    const user_id = req.user.id;
    const treatmentPlanSignatureRepository = getRepository(TreatmentGoalSignature);
    const treatmentFullPlanRepository = getRepository(TreatmentFullPlan);

    const treatmentPlan = await treatmentFullPlanRepository.findOne({
      where: { id: treatment_full_id, deleted_at: null },
    });

    if (!treatmentPlan) {
      const customError = new CustomError(404, 'General', `Treatment Plan not found`, ['Treatment Plan not found.']);
      return next(customError);
    }

    const newSignature = new TreatmentGoalSignature();

    newSignature.full_name = full_name;
    newSignature.treatment_full_id = treatment_full_id;
    newSignature.intake_full_id = intake_full_id;
    newSignature.signature_url = signature_url;
    newSignature.signed_by = user_id;
    newSignature.treatment_plan_type = treatment_plan_type;

    await treatmentPlanSignatureRepository.save(newSignature);

    return res.customSuccess(200, 'Treatment Plan successfully signed.', newSignature);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error signing treatment plan', null, err);
    return next(customError);
  }
};
