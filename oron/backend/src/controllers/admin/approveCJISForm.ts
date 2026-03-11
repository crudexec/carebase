import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CJISFullForm } from 'orm/entities/CJISForm/cjisFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { sendApproveMail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ApproveCJISForm = async (req: Request, res: Response, next: NextFunction) => {
  const CJISFullFormRepository = getRepository(CJISFullForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  try {
    const CJISForm = await CJISFullFormRepository.findOne({ where: { id: form_id } });

    if (!CJISForm) {
      const customError = new CustomError(404, 'General', `CJIS Form not found.`, ['CJIS Form not found.']);
      return next(customError);
    }

    await CJISFullFormRepository.update({ id: form_id }, { status: Status.APPROVED });

    const user = await userRepository.findOne({ where: { id: CJISForm.user_id } });

    if (!user) {
      const customError = new CustomError(404, 'General', `User not found.`, ['User not found.']);
      return next(customError);
    }

    await sendApproveMail(user.first_name, `CJIS Form`, String(user.email));

    return res.customSuccess(200, 'CJIS Form successfully approved.', CJISForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Approving CJIS Form', null, err);
    return next(customError);
  }
};
