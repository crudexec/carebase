import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/User';
import { VaricellaFullForm } from 'orm/entities/VaricellaVaccineForm/varicellaFullForm';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewVaricellaForm = async (req: Request, res: Response, next: NextFunction) => {
  const varicellaFullFormRepository = await getRepository(VaricellaFullForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  const { review_notes } = req.body;
  try {
    const varicellaForm = await varicellaFullFormRepository.findOne({ where: { id: form_id } });

    if (!varicellaForm) {
      const customError = new CustomError(404, 'General', `Varicella Form not found.`, ['Varicella Form not found.']);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: varicellaForm.user_id } });

    await varicellaFullFormRepository.update({ id: form_id }, { status: Status.REVIEWED, review_notes });

    await SendReviewEmail(user.first_name, `Varicella Form`, review_notes, String(user.email));

    return res.customSuccess(200, 'Varicella Form successfully reviewed.', varicellaForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
