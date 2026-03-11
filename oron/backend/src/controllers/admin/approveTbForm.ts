import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TuberculosisFullForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { sendApproveMail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ApproveTbForm = async (req: Request, res: Response, next: NextFunction) => {
  const tbFullFormRepository = getRepository(TuberculosisFullForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  try {
    const tbFullForm = await tbFullFormRepository.findOne({ where: { id: form_id } });

    if (!tbFullForm) {
      const customError = new CustomError(404, 'General', `Tuberculosis Full Form not found.`, [
        'Tuberculosis Full Form not found.',
      ]);
      return next(customError);
    }

    await tbFullFormRepository.update({ id: form_id }, { status: Status.APPROVED });

    const user = await userRepository.findOne({ where: { id: tbFullForm.owner } });

    if (!user) {
      const customError = new CustomError(404, 'General', `User not found.`, ['User not found.']);
      return next(customError);
    }

    await sendApproveMail(user.first_name, `Tuberculosis Form`, String(user.email));

    return res.customSuccess(200, 'Tuberculosis Full Form successfully approved.', tbFullForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
