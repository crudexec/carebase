import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { HepatitisBFullForm } from 'orm/entities/HepatitisBForm/HepatitisFullForm';
import { HepatitisBSignatureForm } from 'orm/entities/HepatitisBForm/signatureForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editHepatitisBSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { signature_data } = req.body;
  const HepatitisBSignatureFormRepository = getRepository(HepatitisBSignatureForm);
  const signed_by = req.user.id;

  try {
    const signatureForm = await HepatitisBSignatureFormRepository.findOne({ where: { signed_by } });
    if (signatureForm) {
      signature_data = signature_data || signatureForm.signature_data;

      const newSignatureForm = new HepatitisBSignatureForm();

      newSignatureForm.signature_data = signature_data;

      await HepatitisBSignatureFormRepository.update(signatureForm.id, newSignatureForm);

      return res.customSuccess(200, 'Emergency contact information successfully created.', newSignatureForm);
    } else {
      const customError = new CustomError(400, 'General', 'Signature form does not exist', [
        `Signature form does not exist`,
      ]);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
