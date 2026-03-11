import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MMRFullForm } from 'orm/entities/MMRVaccineForm/mmrFullForm';
import { MMRSignatureForm } from 'orm/entities/MMRVaccineForm/mmrSignatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addMMRSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { signature_data } = req.body;

  const mmrSignatureFormRepository = getRepository(MMRSignatureForm);
  const mmrFullFormRepository = getRepository(MMRFullForm);
  const signed_by = req.user.id;

  try {
    const newMMRSignatureForm = new MMRSignatureForm();
    const mmrSignatureForm = await mmrSignatureFormRepository.findOne({ where: { signed_by } });

    if (mmrSignatureForm) {
      const customError = new CustomError(400, 'General', 'Signature form already exists', [
        `Signature form already exists`,
      ]);
      return next(customError);
    } else {
      newMMRSignatureForm.signature_data = signature_data;

      newMMRSignatureForm.signed_by = signed_by;

      const savedMMRSignatureForm = await mmrSignatureFormRepository.save(newMMRSignatureForm);

      if (savedMMRSignatureForm) {
        const mmrFullForm = await mmrFullFormRepository.findOne({ where: { user_id: signed_by } });
        if (mmrFullForm) {
          mmrFullForm.signature_id = savedMMRSignatureForm.id;
          await mmrFullFormRepository.save(mmrFullForm);
        } else {
          const newMMRFullForm = new MMRFullForm();
          newMMRFullForm.user_id = signed_by;
          newMMRFullForm.signature_id = savedMMRSignatureForm.id;
          await mmrFullFormRepository.save(newMMRFullForm);
        }
      }
      return res.customSuccess(200, 'Signature form successfully created.', savedMMRSignatureForm);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
