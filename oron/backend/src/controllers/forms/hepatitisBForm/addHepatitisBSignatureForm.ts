import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { HepatitisBFullForm } from 'orm/entities/HepatitisBForm/HepatitisFullForm';
import { HepatitisBSignatureForm } from 'orm/entities/HepatitisBForm/signatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const signHepatitisBSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { signature_data } = req.body;
  const HepatitisBSignatureFormRepository = getRepository(HepatitisBSignatureForm);
  const HepatitisBFullFormRepository = getRepository(HepatitisBFullForm);
  const signed_by = req.user.id;

  try {
    const signatureForm = await HepatitisBSignatureFormRepository.findOne({ where: { signed_by } });
    if (signatureForm) {
      const customError = new CustomError(400, 'General', 'Signature form already exists', [
        `Signature form already exists`,
      ]);
      return next(customError);
    }
    const newSignatureForm = new HepatitisBSignatureForm();
    newSignatureForm.signature_data = signature_data;
    newSignatureForm.signed_by = signed_by;

    const savedSignatureForm = await HepatitisBSignatureFormRepository.save(newSignatureForm);

    if (savedSignatureForm) {
      const fullForm = await HepatitisBFullFormRepository.findOne({ where: { user_id: signed_by } });
      if (fullForm) {
        fullForm.signature_id = savedSignatureForm.id;
        await HepatitisBFullFormRepository.save(fullForm);
      } else {
        const newFullForm = new HepatitisBFullForm();
        newFullForm.user_id = signed_by;
        newFullForm.signature_id = savedSignatureForm.id;
        await HepatitisBFullFormRepository.save(newFullForm);
      }
    }

    return res.customSuccess(200, 'Hepatitis B form signed successfully.', savedSignatureForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
