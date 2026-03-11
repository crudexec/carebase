import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/User';
import { VaricellaFullForm } from 'orm/entities/VaricellaVaccineForm/varicellaFullForm';
import { Status } from 'types/genericEnums';
import { sendApproveMail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ApproveVaricellaForm = async (req: Request, res: Response, next: NextFunction) => {
  const varicellaFullFormRepository = await getRepository(VaricellaFullForm);
  const userRepository = await getRepository(User);
  const form_id = req.params.id;
  try {
    const varicellaForm = await varicellaFullFormRepository.findOne({ where: { id: form_id } });

    if (!varicellaForm) {
      const customError = new CustomError(404, 'General', `Varicella Form not found.`, ['Varicella Form not found.']);
      return next(customError);
    }

    await varicellaFullFormRepository.update({ id: form_id }, { status: Status.APPROVED });

    const user = await userRepository.findOne({ where: { id: varicellaForm.user_id } });

    if (!user) {
      const customError = new CustomError(404, 'General', `User not found.`, ['User not found.']);
      return next(customError);
    }

    await sendApproveMail(user.first_name, `Varicella Form`, String(user.email));

    return res.customSuccess(200, 'Varicella Form successfully approved.', varicellaForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
