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

export const addFcSignature = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const { signature_url, full_name, parent_signature_url, visit_full_form_id } = req.body;
    const FcSignatureRepository = getRepository(FcTreatmentPlanSignature);
    const visitFullFormRepository = getRepository(FcVisitFullForm);

    const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
      return next(customError);
    }

    const FcSignature = new FcTreatmentPlanSignature();

    FcSignature.signature_url = signature_url;
    FcSignature.full_name = full_name;
    FcSignature.parent_signature_url = parent_signature_url;

    const savedFcSignature = await FcSignatureRepository.save(FcSignature);

    if (savedFcSignature) {
      await visitFullFormRepository.update(visit_full_form_id, { treatment_plan_signature_id: savedFcSignature.id });
    }

    return res.customSuccess(200, 'Signature successfully added.', savedFcSignature);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Family Discussion', null, err);
    return next(customError);
  }
};
