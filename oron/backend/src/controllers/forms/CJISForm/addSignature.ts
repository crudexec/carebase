import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CJISFullForm } from 'orm/entities/CJISForm/cjisFullForm';
import { CJISSignatureForm } from 'orm/entities/CJISForm/cjisSignature';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addSignatureData = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { signature_data } = req.body;

  try {
    const signatureRepository = getRepository(CJISSignatureForm);
    const cjisFullFormRepository = getRepository(CJISFullForm);

    const user_id = req.user.id;

    const cjisSignature = await signatureRepository.findOne({ where: { signed_by: user_id } });

    if (cjisSignature) {
      const customError = new CustomError(400, 'General', 'CJIS Signature already exists', [
        `CJIS Signature Form already exists`,
      ]);
      return next(customError);
    }

    const newCJISSignature = new CJISSignatureForm();
    newCJISSignature.signature_data = signature_data;
    newCJISSignature.signed_by = user_id;

    const savedCJISSignature = await signatureRepository.save(newCJISSignature);

    if (savedCJISSignature) {
      const newCJISForm = new CJISFullForm();
      const cjisForm = await cjisFullFormRepository.findOne({ where: { user_id } });
      if (cjisForm) {
        newCJISForm.signature_id = savedCJISSignature.id;
        newCJISForm.status = Status.IN_PROGRESS;
        await cjisFullFormRepository.update(cjisForm.id, newCJISForm);
        return res.customSuccess(200, 'CJIS Signature Form successfully created.', savedCJISSignature);
      }
      newCJISForm.signature_id = savedCJISSignature.id;
      newCJISForm.status = Status.IN_PROGRESS;
      await cjisFullFormRepository.save(newCJISForm);
      return res.customSuccess(200, 'CJIS Signature Form successfully created.', savedCJISSignature);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
