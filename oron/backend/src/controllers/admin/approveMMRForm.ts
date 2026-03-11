import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MMRFullForm } from 'orm/entities/MMRVaccineForm/mmrFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { sendApproveMail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ApproveMMRForm = async (req: Request, res: Response, next: NextFunction) => {
  const mmrFullForm = getRepository(MMRFullForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  try {
    const mmrForm = await mmrFullForm.findOne({ where: { id: form_id } });

    if (!mmrForm) {
      const customError = new CustomError(404, 'General', `MMR Form not found.`, ['MMR Form not found.']);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: mmrForm.user_id } });

    if (!user) {
      const customError = new CustomError(404, 'General', `User not found.`, ['User not found.']);
      return next(customError);
    }

    await mmrFullForm.update({ id: form_id }, { status: Status.APPROVED });

    await sendApproveMail(user.first_name, `MMR Form`, String(user.email));

    return res.customSuccess(200, 'MMR Form successfully approved.', mmrForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
