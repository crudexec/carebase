import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { HepatitisBAttestationForm } from 'orm/entities/HepatitisBForm/attestationForm';
import { HepatitisBFullForm } from 'orm/entities/HepatitisBForm/HepatitisFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addHepatitisAttestation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const {
    had_hepatitis_b_vaccine_series_of_three,
    arranged_for_hepatitis_b_vaccine_series_of_three,
    declined_hepatitis_b_vaccine_series_of_three,
  } = req.body;
  const HepatitisBAttestationFormRepository = getRepository(HepatitisBAttestationForm);
  const HepatitisBFullFormRepository = getRepository(HepatitisBFullForm);
  const user_id = req.user.id;

  try {
    const attestationForm = await HepatitisBAttestationFormRepository.findOne({ where: { user_id } });
    if (attestationForm) {
      const customError = new CustomError(400, 'General', 'Attestation form already exists', [
        `Attestation form already exists`,
      ]);
      return next(customError);
    }
    const newAttestationForm = new HepatitisBAttestationForm();
    newAttestationForm.had_hepatitis_b_vaccine_series_of_three = had_hepatitis_b_vaccine_series_of_three;
    newAttestationForm.arranged_for_hepatitis_b_vaccine_series_of_three =
      arranged_for_hepatitis_b_vaccine_series_of_three;
    newAttestationForm.declined_hepatitis_b_vaccine_series_of_three = declined_hepatitis_b_vaccine_series_of_three;
    newAttestationForm.user_id = user_id;

    const savedAttestationForm = await HepatitisBAttestationFormRepository.save(newAttestationForm);

    if (savedAttestationForm) {
      const fullForm = await HepatitisBFullFormRepository.findOne({ where: { user_id } });
      if (fullForm) {
        fullForm.attestation_id = savedAttestationForm.id;
        fullForm.status = Status.IN_PROGRESS;
        await HepatitisBFullFormRepository.save(fullForm);
      } else {
        const newFullForm = new HepatitisBFullForm();
        newFullForm.user_id = user_id;
        newFullForm.attestation_id = savedAttestationForm.id;
        newFullForm.status = Status.IN_PROGRESS;
        await HepatitisBFullFormRepository.save(newFullForm);
      }
    }
    return res.customSuccess(200, 'Attestation form successfully created.', savedAttestationForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
