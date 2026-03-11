import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { N95FitFullForm } from 'orm/entities/N95Form/n95FullForm';
import { N95FitSignatureForm } from 'orm/entities/N95Form/signatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addN95SignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { signature_data, full_name, date_of_filling_form } = req.body;

  const user_id = req.user.id;

  const n95FitSignatureFormRepository = getRepository(N95FitSignatureForm);
  const n95FitFullFormRepository = getRepository(N95FitFullForm);

  try {
    const signatureForm = await n95FitSignatureFormRepository.findOne({ where: { signed_by: user_id } });

    if (signatureForm) {
      const customError = new CustomError(400, 'General', 'Signature form already exists', [
        `Signature form already exists`,
      ]);
      return next(customError);
    }

    const newSignatureForm = new N95FitSignatureForm();
    newSignatureForm.signature_data = signature_data;
    newSignatureForm.full_name = full_name;
    newSignatureForm.date_of_filling_form = date_of_filling_form;
    newSignatureForm.signed_by = user_id;

    const savedSignatureForm = await n95FitSignatureFormRepository.save(newSignatureForm);

    if (savedSignatureForm) {
      const fullForm = await n95FitFullFormRepository.findOne({ where: { user_id } });
      if (fullForm) {
        fullForm.signature_id = savedSignatureForm.id;
        await n95FitFullFormRepository.save(fullForm);
      } else {
        const newFullForm = new N95FitFullForm();
        newFullForm.user_id = user_id;
        newFullForm.signature_id = savedSignatureForm.id;
        await n95FitFullFormRepository.save(newFullForm);
      }
    }
    return res.customSuccess(200, 'N95 signature form signed successfully.', savedSignatureForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
