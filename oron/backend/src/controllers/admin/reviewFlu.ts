import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { FluFullForm } from 'orm/entities/FluForm/fluFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewFluForm = async (req: Request, res: Response, next: NextFunction) => {
  const fluFullFormRepository = getRepository(FluFullForm);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  const { review_notes } = req.body;
  try {
    const fluFullForm = await fluFullFormRepository.findOne({ where: { id: form_id } });

    if (!fluFullForm) {
      const customError = new CustomError(404, 'General', `Flu Full Form not found.`, ['Flu Full Form not found.']);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: fluFullForm.user_id } });
    await fluFullFormRepository.update({ id: form_id }, { status: Status.REVIEWED, review_notes });
    await SendReviewEmail(user.first_name, `Flu Form`, review_notes, String(user.email));

    return res.customSuccess(200, 'User BioData successfully reviewed', fluFullForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
