import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ReferenceForm } from 'orm/entities/ReferenceForm/reference';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { sendApproveMail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ApproveReferenceForm = async (req: Request, res: Response, next: NextFunction) => {
  const referenceFormRepository = getRepository(ReferenceForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  try {
    const referenceForm = await referenceFormRepository.findOne({ where: { id: form_id } });

    if (!referenceForm) {
      const customError = new CustomError(404, 'General', `Reference Form not found.`, ['Reference Form not found.']);
      return next(customError);
    }

    await referenceFormRepository.update({ id: form_id }, { status: Status.APPROVED });

    const user = await userRepository.findOne({ where: { id: referenceForm.user_id } });

    if (!user) {
      const customError = new CustomError(404, 'General', `User not found.`, ['User not found.']);
      return next(customError);
    }

    await sendApproveMail(user.first_name, `Reference Form`, String(user.email));

    return res.customSuccess(200, 'Reference Form successfully approved.', referenceForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Approving Reference Form', null, err);
    return next(customError);
  }
};
