import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PneumococcalVaccinationForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalVaccinationForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editPneumococcalVaccinationInformation = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  let {
    had_pneumococcal_vaccination,
    declined_pneumococcal_vaccination,
    received_pneumococcal_vaccination,
    medical_contraindication,
    religious_beliefs,
    other,
  } = req.body;
  const pneumococcalVaccinationFormRepository = getRepository(PneumococcalVaccinationForm);
  const user_id = req.user.id;

  try {
    const pneumococcalVaccinationForm = await pneumococcalVaccinationFormRepository.findOne({ where: { user_id } });
    if (pneumococcalVaccinationForm) {
      other = other ?? pneumococcalVaccinationForm.other;

      const newPneumococcalVaccinationForm = new PneumococcalVaccinationForm();
      newPneumococcalVaccinationForm.had_pneumococcal_vaccination = had_pneumococcal_vaccination;
      newPneumococcalVaccinationForm.declined_pneumococcal_vaccination = declined_pneumococcal_vaccination;
      newPneumococcalVaccinationForm.received_pneumococcal_vaccination = received_pneumococcal_vaccination;
      newPneumococcalVaccinationForm.medical_contraindication = medical_contraindication;
      newPneumococcalVaccinationForm.religious_beliefs = religious_beliefs;
      newPneumococcalVaccinationForm.other = other;

      await pneumococcalVaccinationFormRepository.update(
        pneumococcalVaccinationForm.id,
        newPneumococcalVaccinationForm,
      );

      return res.customSuccess(
        200,
        'User pneumococcal vaccination information successfully updated for the pneumococcal form.',
        newPneumococcalVaccinationForm,
      );
    } else {
      const customError = new CustomError(
        400,
        'General',
        'User pneumococcal vaccination information does not exist for the pneumococcal form',
        [`Pneumococcal vaccination information does not exist`],
      );
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
