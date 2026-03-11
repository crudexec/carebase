import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PneumococcalVaccinationFullForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewPneumococcalForm = async (req: Request, res: Response, next: NextFunction) => {
  const pneumococcalFormRepository = getRepository(PneumococcalVaccinationFullForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  const { review_notes } = req.body;
  try {
    const pneumococcalForm = await pneumococcalFormRepository.findOne({ where: { id: form_id } });

    if (!pneumococcalForm) {
      const customError = new CustomError(404, 'General', `Pneumococcal Form not found.`, [
        'Pneumococcal Form not found.',
      ]);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: pneumococcalForm.user_id } });

    await pneumococcalFormRepository.update({ id: form_id }, { status: Status.REVIEWED, review_notes });

    await SendReviewEmail(user.first_name, `Pneumococcal Form`, review_notes, String(user.email));

    return res.customSuccess(200, 'Pneumococcal Form successfully reviewed.', pneumococcalForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
