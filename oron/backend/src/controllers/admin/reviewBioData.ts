import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UserBioData } from 'orm/entities/userBioData';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewBioDataForm = async (req: Request, res: Response, next: NextFunction) => {
  const userBioDataRepository = getRepository(UserBioData);
  const form_id = req.params.id;
  const { review_notes } = req.body;
  try {
    const userBioData = await userBioDataRepository.findOne({ where: { id: form_id } });

    if (!userBioData) {
      const customError = new CustomError(404, 'General', `User BioData not found.`, ['User BioData not found.']);
      return next(customError);
    }

    await userBioDataRepository.update({ id: form_id }, { status: Status.REVIEWED, review_notes });

    await SendReviewEmail(userBioData.first_name, `Biodata Form`, review_notes, String(userBioData.email));

    return res.customSuccess(200, 'User BioData successfully reviewed', userBioData);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
