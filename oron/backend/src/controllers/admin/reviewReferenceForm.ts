import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ReferenceForm } from 'orm/entities/ReferenceForm/reference';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewReferenceForm = async (req: Request, res: Response, next: NextFunction) => {
  const referenceFormRepository = getRepository(ReferenceForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  const { review_notes } = req.body;
  try {
    const referenceForm = await referenceFormRepository.findOne({ where: { id: form_id } });

    if (!referenceForm) {
      const customError = new CustomError(404, 'General', `Reference Form not found.`, ['Reference Form not found.']);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: referenceForm.user_id } });

    await referenceFormRepository.update({ id: form_id }, { status: Status.REVIEWED, review_notes });

    await SendReviewEmail(user.first_name, `Reference Form`, review_notes, String(user.email));

    return res.customSuccess(200, 'Reference Form successfully reviewed.', referenceForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Reviewing Reference Form', null, err);
    return next(customError);
  }
};
