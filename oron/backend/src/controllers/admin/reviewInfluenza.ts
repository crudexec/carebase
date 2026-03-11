import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { InfluenzaVaccinationDeclinationFullForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewInfluenzaForm = async (req: Request, res: Response, next: NextFunction) => {
  const influenzaVaccinationDeclinationFullFormRepository = getRepository(InfluenzaVaccinationDeclinationFullForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  const { review_notes } = req.body;
  try {
    const influenzaForm = await influenzaVaccinationDeclinationFullFormRepository.findOne({ where: { id: form_id } });

    if (!influenzaForm) {
      const customError = new CustomError(404, 'General', `Influenza Form not found.`, ['Influenza Form not found.']);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: influenzaForm.user_id } });

    await influenzaVaccinationDeclinationFullFormRepository.update(
      { id: form_id },
      { status: Status.REVIEWED, review_notes },
    );

    await SendReviewEmail(user.first_name, `Influenza Form`, review_notes, String(user.email));

    return res.customSuccess(200, 'Influenza Form successfully reviewed.', influenzaForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
