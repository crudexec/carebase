import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CJISSignatureForm } from 'orm/entities/CJISForm/cjisSignature';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editSignatureData = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { signature_data } = req.body;

  try {
    const signatureRepository = getRepository(CJISSignatureForm);

    const user_id = req.user.id;

    const cjisSignature = await signatureRepository.findOne({ where: { signed_by: user_id } });

    if (!cjisSignature) {
      const customError = new CustomError(400, 'General', 'CJIS Signature does not exist', [
        `CJIS Signature Form does not exist`,
      ]);
      return next(customError);
    }

    signature_data = signature_data ?? cjisSignature.signature_data;

    const newCJISSignature = new CJISSignatureForm();
    newCJISSignature.signature_data = signature_data;

    await signatureRepository.update(cjisSignature.id, newCJISSignature);

    return res.customSuccess(200, 'CJIS Signature Form successfully updated.', newCJISSignature);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
