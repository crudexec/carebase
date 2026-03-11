import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ReferralInformation } from 'orm/entities/IntakeForm/referralInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveReferalInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const referralInformationRepository = getRepository(ReferralInformation);
  const user_id = req.user.id;

  try {
    const referralInformation = await referralInformationRepository.findOne({ where: { user_id } });
    if (referralInformation) {
      return res.customSuccess(200, 'Referral Information successfully retrieved.', referralInformation);
    } else {
      return res.customSuccess(200, 'Referral Information has not been filled', null);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
