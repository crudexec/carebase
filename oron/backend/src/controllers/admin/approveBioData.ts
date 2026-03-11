import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UserBioData } from 'orm/entities/userBioData';
import { Status } from 'types/genericEnums';
import { sendApproveMail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ApproveBioDataForm = async (req: Request, res: Response, next: NextFunction) => {
  const userBioDataRepository = getRepository(UserBioData);
  const form_id = req.params.id;
  try {
    const userBioData = await userBioDataRepository.findOne({ where: { id: form_id } });

    if (!userBioData) {
      const customError = new CustomError(404, 'General', `User BioData not found.`, ['User BioData not found.']);
      return next(customError);
    }

    await userBioDataRepository.update({ id: form_id }, { status: Status.APPROVED });

    await sendApproveMail(userBioData.first_name, `Biodata Form`, String(userBioData.email));

    return res.customSuccess(200, 'User BioData successfully approved.', userBioData);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
