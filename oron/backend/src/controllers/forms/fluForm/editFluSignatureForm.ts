import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { FluSignatureForm } from 'orm/entities/FluForm/fluSignatureForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editFluSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const signed_by = req.user.id;
  const fluSignatureFormRepository = getRepository(FluSignatureForm);

  let { signature_data } = req.body;

  try {
    const signatureForm = await fluSignatureFormRepository.findOne({ signed_by });

    if (signatureForm) {
      signature_data = signature_data ?? signatureForm.signature_data;

      const newSignatureForm = new FluSignatureForm();
      newSignatureForm.signature_data = signature_data;

      await fluSignatureFormRepository.update(signatureForm.id, newSignatureForm);

      return res.customSuccess(200, 'Flu signature form successfully updated.', newSignatureForm);
    } else {
      const customError = new CustomError(400, 'General', 'Flu signature form does not exist', [
        `Flu signature form does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
