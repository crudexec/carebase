import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { InfluenzaSignatureForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/signatureForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editInfluenzaSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { signature_data } = req.body;
  const signed_by = req.user.id;
  const influenzaSignatureFormRepository = getRepository(InfluenzaSignatureForm);
  try {
    const signatureForm = await influenzaSignatureFormRepository.findOne({ where: { signed_by } });

    if (signatureForm) {
      signature_data = signature_data ?? signatureForm.signature_data;

      const newSignatureForm = new InfluenzaSignatureForm();
      newSignatureForm.signature_data = signature_data;

      await influenzaSignatureFormRepository.update(signatureForm.id, newSignatureForm);

      return res.customSuccess(200, 'Influenza signature form successfully updated.', newSignatureForm);
    } else {
      const customError = new CustomError(400, 'General', 'Influenza signature form does not exist', [
        `Influenza signature form does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
