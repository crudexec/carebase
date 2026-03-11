import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VaricellaFullForm } from 'orm/entities/VaricellaVaccineForm/varicellaFullForm';
import { VaricellaSignatureForm } from 'orm/entities/VaricellaVaccineForm/varicellaSignatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addVaricellaSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { signature_data } = req.body;
  const signed_by = req.user.id;

  const VaricellaSignatureFormRepository = getRepository(VaricellaSignatureForm);

  const VaricellaFullFormRepository = getRepository(VaricellaFullForm);

  try {
    const newVaricellaSignatureForm = new VaricellaSignatureForm();

    const varicellaSignatureForm = await VaricellaSignatureFormRepository.findOne({ where: { signed_by } });

    if (varicellaSignatureForm) {
      const customError = new CustomError(400, 'General', 'Varicella Signature form already exists', [
        `Varicella Signature form already exists`,
      ]);
      return next(customError);
    }

    newVaricellaSignatureForm.signature_data = signature_data;
    newVaricellaSignatureForm.signed_by = signed_by;

    const savedVaricellaSignatureForm = await VaricellaSignatureFormRepository.save(newVaricellaSignatureForm);

    if (savedVaricellaSignatureForm) {
      const varicellaFullForm = await VaricellaFullFormRepository.findOne({ where: { user_id: signed_by } });
      if (varicellaFullForm) {
        varicellaFullForm.signature_id = savedVaricellaSignatureForm.id;
        await VaricellaFullFormRepository.save(varicellaFullForm);
      } else {
        const newVaricellaFullForm = new VaricellaFullForm();
        newVaricellaFullForm.user_id = signed_by;
        newVaricellaFullForm.signature_id = savedVaricellaSignatureForm.id;
        await VaricellaFullFormRepository.save(newVaricellaFullForm);
      }
    }

    return res.customSuccess(200, 'Varicella Vaccine form successfully created.', savedVaricellaSignatureForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
