import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PneumococcalVaccinationFullForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm';
import { PneumococcalVaccinationForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalVaccinationForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fillPneumococcalVaccinationInformation = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  const {
    had_pneumococcal_vaccination,
    declined_pneumococcal_vaccination,
    received_pneumococcal_vaccination,
    medical_contraindication,
    religious_beliefs,
    other,
  } = req.body;
  const pneumococcalVaccinationFormRepository = getRepository(PneumococcalVaccinationForm);
  const pneumococcalVaccinationFullFormRepository = getRepository(PneumococcalVaccinationFullForm);
  const user_id = req.user.id;

  try {
    const pneumococcalVaccinationForm = await pneumococcalVaccinationFormRepository.findOne({ where: { user_id } });
    if (pneumococcalVaccinationForm) {
      const customError = new CustomError(
        400,
        'General',
        'User pneumococcal vaccination information already exists for the pneumococcal form',
        [`Pneumococcal vaccination information already exists`],
      );
      return next(customError);
    }
    const newPneumococcalVaccinationForm = new PneumococcalVaccinationForm();
    newPneumococcalVaccinationForm.had_pneumococcal_vaccination = had_pneumococcal_vaccination;
    newPneumococcalVaccinationForm.declined_pneumococcal_vaccination = declined_pneumococcal_vaccination;
    newPneumococcalVaccinationForm.received_pneumococcal_vaccination = received_pneumococcal_vaccination;
    newPneumococcalVaccinationForm.medical_contraindication = medical_contraindication;
    newPneumococcalVaccinationForm.religious_beliefs = religious_beliefs;
    newPneumococcalVaccinationForm.other = other;
    newPneumococcalVaccinationForm.user_id = user_id;

    const savedPneumococcalVaccinationForm = await pneumococcalVaccinationFormRepository.save(
      newPneumococcalVaccinationForm,
    );

    if (savedPneumococcalVaccinationForm) {
      const pneumococcalVaccinationFullForm = await pneumococcalVaccinationFullFormRepository.findOne({
        where: { user_id },
      });
      if (pneumococcalVaccinationFullForm) {
        pneumococcalVaccinationFullForm.pneumococcal_vaccination_form_id = savedPneumococcalVaccinationForm.id;
        pneumococcalVaccinationFullForm.status = Status.IN_PROGRESS;
        await pneumococcalVaccinationFullFormRepository.save(pneumococcalVaccinationFullForm);
      } else {
        const newPneumococcalVaccinationFullForm = new PneumococcalVaccinationFullForm();
        newPneumococcalVaccinationFullForm.user_id = user_id;
        newPneumococcalVaccinationFullForm.pneumococcal_vaccination_form_id = savedPneumococcalVaccinationForm.id;
        newPneumococcalVaccinationFullForm.status = Status.IN_PROGRESS;
        await pneumococcalVaccinationFullFormRepository.save(newPneumococcalVaccinationFullForm);
      }
    }

    return res.customSuccess(
      200,
      'User pneumococcal vaccination information successfully created for the pneumococcal form.',
      savedPneumococcalVaccinationForm,
    );
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
