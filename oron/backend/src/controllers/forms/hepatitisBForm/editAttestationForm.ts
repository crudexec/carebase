import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { HepatitisBAttestationForm } from 'orm/entities/HepatitisBForm/attestationForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editHepatitisAttestation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const {
    had_hepatitis_b_vaccine_series_of_three,
    arranged_for_hepatitis_b_vaccine_series_of_three,
    declined_hepatitis_b_vaccine_series_of_three,
  } = req.body;
  const HepatitisBAttestationFormRepository = getRepository(HepatitisBAttestationForm);
  const user_id = req.user.id;

  try {
    const attestationForm = await HepatitisBAttestationFormRepository.findOne({ where: { user_id } });
    if (attestationForm) {
      const newAttestationForm = new HepatitisBAttestationForm();
      newAttestationForm.had_hepatitis_b_vaccine_series_of_three = had_hepatitis_b_vaccine_series_of_three;
      newAttestationForm.arranged_for_hepatitis_b_vaccine_series_of_three =
        arranged_for_hepatitis_b_vaccine_series_of_three;
      newAttestationForm.declined_hepatitis_b_vaccine_series_of_three = declined_hepatitis_b_vaccine_series_of_three;

      await HepatitisBAttestationFormRepository.update(attestationForm.id, newAttestationForm);

      return res.customSuccess(200, 'Emergency contact information successfully created.', newAttestationForm);
    } else {
      const customError = new CustomError(400, 'General', 'Attestation form does not exist', [
        `Attestation form does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
