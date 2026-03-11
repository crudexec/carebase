import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { HepatitisBFullForm } from 'orm/entities/HepatitisBForm/HepatitisFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewHepatitisForm = async (req: Request, res: Response, next: NextFunction) => {
  const hepatitisBFormRepository = getRepository(HepatitisBFullForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  const { review_notes } = req.body;
  try {
    const hepatitisBForm = await hepatitisBFormRepository.findOne({ where: { id: form_id } });

    if (!hepatitisBForm) {
      const customError = new CustomError(404, 'General', `Hepatitis Form not found.`, ['Hepatitis Form not found.']);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: hepatitisBForm.user_id } });

    await hepatitisBFormRepository.update({ id: form_id }, { status: Status.REVIEWED, review_notes });
    await SendReviewEmail(user.first_name, `Hepatitis B Form`, review_notes, String(user.email));

    return res.customSuccess(200, 'Hepatitis Form successfully reviewed', hepatitisBForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
