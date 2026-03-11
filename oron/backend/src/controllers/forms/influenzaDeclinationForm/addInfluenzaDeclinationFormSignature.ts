import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { InfluenzaVaccinationDeclinationFullForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm';
import { InfluenzaSignatureForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/signatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addInfluenzaSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { signature_data } = req.body;
  const signed_by = req.user.id;
  const influenzaSignatureFormRepository = getRepository(InfluenzaSignatureForm);
  const influenzaVaccinationDeclinationFullFormRepository = getRepository(InfluenzaVaccinationDeclinationFullForm);
  try {
    const signatureForm = await influenzaSignatureFormRepository.findOne({ where: { signed_by } });

    if (signatureForm) {
      const customError = new CustomError(400, 'General', 'Influenza signature form already exists', [
        `Influenza signature form already exists`,
      ]);
      return next(customError);
    }

    const newSignatureForm = new InfluenzaSignatureForm();
    newSignatureForm.signature_data = signature_data;
    newSignatureForm.signed_by = signed_by;

    const savedSignatureForm = await influenzaSignatureFormRepository.save(newSignatureForm);

    if (savedSignatureForm) {
      const influenzaVaccinationDeclinationFullForm = await influenzaVaccinationDeclinationFullFormRepository.findOne({
        where: { user_id: signed_by },
      });

      if (influenzaVaccinationDeclinationFullForm) {
        influenzaVaccinationDeclinationFullForm.signature_id = savedSignatureForm.id;
        await influenzaVaccinationDeclinationFullFormRepository.update(
          influenzaVaccinationDeclinationFullForm.id,
          influenzaVaccinationDeclinationFullForm,
        );
      } else {
        const newInfluenzaVaccinationDeclinationFullForm = new InfluenzaVaccinationDeclinationFullForm();
        newInfluenzaVaccinationDeclinationFullForm.signature_id = savedSignatureForm.id;
        newInfluenzaVaccinationDeclinationFullForm.user_id = signed_by;
        await influenzaVaccinationDeclinationFullFormRepository.save(newInfluenzaVaccinationDeclinationFullForm);
      }
    }

    return res.customSuccess(200, 'Influenza signature form successfully created.', savedSignatureForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
