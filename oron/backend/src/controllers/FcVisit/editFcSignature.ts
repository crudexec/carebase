import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { FcVisitFullForm } from 'orm/entities/FCVisitLog/fcVisitFullForm';
import { FcTreatmentPlanSignature } from 'orm/entities/FCVisitLog/stepThree/fcSignature';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editFcSignature = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let { signature_url, full_name, parent_signature_url, treatment_plan_signature_id } = req.body;
    const FcSignatureRepository = getRepository(FcTreatmentPlanSignature);
    const visitFullFormRepository = getRepository(FcVisitFullForm);

    const alreadyExistingFcSignature = await FcSignatureRepository.findOne({
      where: { id: treatment_plan_signature_id, deleted_at: null },
    });

    if (!alreadyExistingFcSignature) {
      const customError = new CustomError(404, 'General', `Signature not found`, ['Signature not found.']);
      return next(customError);
    }

    signature_url = signature_url ?? alreadyExistingFcSignature.signature_url;
    full_name = full_name ?? alreadyExistingFcSignature.full_name;
    parent_signature_url = parent_signature_url ?? alreadyExistingFcSignature.parent_signature_url;

    const FcSignature = new FcTreatmentPlanSignature();

    FcSignature.signature_url = signature_url;
    FcSignature.full_name = full_name;
    FcSignature.parent_signature_url = parent_signature_url;

    await FcSignatureRepository.update(treatment_plan_signature_id, FcSignature);

    return res.customSuccess(200, 'Signature successfully updated.', FcSignature);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding FC Signature', null, err);
    return next(customError);
  }
};
