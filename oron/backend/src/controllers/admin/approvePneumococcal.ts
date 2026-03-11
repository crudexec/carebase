import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PneumococcalVaccinationFullForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { sendApproveMail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ApprovePneumococcalForm = async (req: Request, res: Response, next: NextFunction) => {
  const pneumococcalFormRepository = getRepository(PneumococcalVaccinationFullForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  try {
    const pneumococcalForm = await pneumococcalFormRepository.findOne({ where: { id: form_id } });

    if (!pneumococcalForm) {
      const customError = new CustomError(404, 'General', `Pneumococcal Form not found.`, [
        'Pneumococcal Form not found.',
      ]);
      return next(customError);
    }

    await pneumococcalFormRepository.update({ id: form_id }, { status: Status.APPROVED });

    const user = await userRepository.findOne({ where: { id: pneumococcalForm.user_id } });

    if (!user) {
      const customError = new CustomError(404, 'General', `User not found.`, ['User not found.']);
      return next(customError);
    }

    await sendApproveMail(user.first_name, `Pneumococcal Form`, String(user.email));

    return res.customSuccess(200, 'Pneumococcal Form successfully approved.', pneumococcalForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
