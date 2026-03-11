import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CJISFullForm } from 'orm/entities/CJISForm/cjisFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewCJISForm = async (req: Request, res: Response, next: NextFunction) => {
  const cjisFormRepository = getRepository(CJISFullForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  const { review_notes } = req.body;
  try {
    const cjisForm = await cjisFormRepository.findOne({ where: { id: form_id } });

    if (!cjisForm) {
      const customError = new CustomError(404, 'General', `CJIS Form not found.`, ['CJIS Form not found.']);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: cjisForm.user_id } });

    await cjisFormRepository.update({ id: form_id }, { status: Status.REVIEWED, review_notes });

    await SendReviewEmail(user.first_name, `CJIS Form`, review_notes, String(user.email));

    return res.customSuccess(200, 'CJIS Form successfully reviewed', cjisForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error reviewing CJIS form', null, err);
    return next(customError);
  }
};
