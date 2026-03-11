import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TuberculosisFullForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewTbForm = async (req: Request, res: Response, next: NextFunction) => {
  const tbFullFormRepository = getRepository(TuberculosisFullForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  const { review_notes } = req.body;
  try {
    const tbFullForm = await tbFullFormRepository.findOne({ where: { id: form_id } });

    if (!tbFullForm) {
      const customError = new CustomError(404, 'General', `Tuberculosis Full Form not found.`, [
        'Tuberculosis Full Form not found.',
      ]);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: tbFullForm.owner } });

    await tbFullFormRepository.update({ id: form_id }, { status: Status.REVIEWED, review_notes });

    await SendReviewEmail(user.first_name, `Tuberculosis Form`, review_notes, String(user.email));

    return res.customSuccess(200, 'Tuberculosis Full Form successfully reviewed.', tbFullForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
