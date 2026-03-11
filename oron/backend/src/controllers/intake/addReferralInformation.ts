import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { ReferralInformation } from 'orm/entities/IntakeForm/referralInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addReferralInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const { date_of_referral, referral_source_name, referral_type, client_information_id, intake_full_id } = req.body;
    const referralInformationRepository = getRepository(ReferralInformation);
    const intakeFullFormRepository = getRepository(IntakeFullForm);
    const user_id = req.user.id;

    const newReferralInformation = new ReferralInformation();
    newReferralInformation.date_of_referral = date_of_referral;
    newReferralInformation.referral_source_name = referral_source_name;
    newReferralInformation.referral_type = referral_type;
    newReferralInformation.registered_by = user_id;

    const savedReferralInformation = await referralInformationRepository.save(newReferralInformation);

    if (savedReferralInformation) {
      const newIntakeFullForm = new IntakeFullForm();
      const alreadyExistingIntakeFullForm = await intakeFullFormRepository.findOne({
        where: { id: intake_full_id, deleted_at: null },
      });

      if (alreadyExistingIntakeFullForm) {
        newIntakeFullForm.referral_information_id = savedReferralInformation.id;
        await intakeFullFormRepository.update(alreadyExistingIntakeFullForm.id, newIntakeFullForm);
      }
    }
    return res.customSuccess(200, 'Referral Information successfully created.', savedReferralInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error', null, err);
    return next(customError);
  }
};
