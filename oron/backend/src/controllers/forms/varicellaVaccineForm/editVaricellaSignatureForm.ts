import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VaricellaSignatureForm } from 'orm/entities/VaricellaVaccineForm/varicellaSignatureForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editVaricellaSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { signature_data } = req.body;
  const signed_by = req.user.id;

  const VaricellaSignatureFormRepository = getRepository(VaricellaSignatureForm);

  try {
    const newVaricellaSignatureForm = new VaricellaSignatureForm();

    const varicellaSignatureForm = await VaricellaSignatureFormRepository.findOne({ where: { signed_by } });

    if (varicellaSignatureForm) {
      signature_data = signature_data ?? varicellaSignatureForm.signature_data;

      newVaricellaSignatureForm.signature_data = signature_data;

      await VaricellaSignatureFormRepository.update(varicellaSignatureForm.id, newVaricellaSignatureForm);
      return res.customSuccess(200, 'Varicella Signature form successfully updated.', newVaricellaSignatureForm);
    } else {
      const customError = new CustomError(400, 'General', 'Varicella Signature form does not exist', [
        `Varicella Signature form does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
