import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ReferralInformation } from 'orm/entities/IntakeForm/referralInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editReferralInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let { date_of_referral, referral_source_name, referral_type } = req.body;
    const referralInformationRepository = getRepository(ReferralInformation);
    const form_id = req.params.form_id;

    const referralInformation = await referralInformationRepository.findOne({ where: { id: form_id } });
    if (!referralInformation) {
      const customError = new CustomError(400, 'General', 'Referral Information does not exist', [
        `Referral Information does not exist`,
      ]);
      return next(customError);
    }

    date_of_referral = date_of_referral ?? referralInformation.date_of_referral;
    referral_source_name = referral_source_name ?? referralInformation.referral_source_name;
    referral_type = referral_type ?? referralInformation.referral_type;

    const newReferralInformation = new ReferralInformation();
    newReferralInformation.date_of_referral = date_of_referral;
    newReferralInformation.referral_source_name = referral_source_name;
    newReferralInformation.referral_type = referral_type;

    await referralInformationRepository.update({ id: referralInformation.id }, newReferralInformation);
    return res.customSuccess(200, 'Referral Information successfully updated.', newReferralInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error', null, err);
    return next(customError);
  }
};
