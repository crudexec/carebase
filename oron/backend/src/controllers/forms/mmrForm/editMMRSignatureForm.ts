import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MMRSignatureForm } from 'orm/entities/MMRVaccineForm/mmrSignatureForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editMMRSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { signature_data } = req.body;
  const mmrSignatureFormRepository = getRepository(MMRSignatureForm);
  const signed_by = req.user.id;

  try {
    const newMMRSignatureForm = new MMRSignatureForm();
    const mmrSignatureForm = await mmrSignatureFormRepository.findOne({ where: { signed_by } });

    if (mmrSignatureForm) {
      signature_data = signature_data ?? mmrSignatureForm.signature_data;

      newMMRSignatureForm.signature_data = signature_data;

      await mmrSignatureFormRepository.update(mmrSignatureForm.id, newMMRSignatureForm);
      return res.customSuccess(200, 'Signature form successfully updated.', newMMRSignatureForm);
    } else {
      const customError = new CustomError(400, 'General', 'Signature form does not exist', [
        `Signature form does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
