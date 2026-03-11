import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { PeoplePresentInformation } from 'orm/entities/IntakeForm/peoplePresent';
import { WaiverServices } from 'orm/entities/IntakeForm/waiverService';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveFullIntake = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const intakeFullFormRepository = getRepository(IntakeFullForm);
  const waiverServiceRepository = getRepository(WaiverServices);
  const peoplePresentInformationRepository = getRepository(PeoplePresentInformation);
  const account_id = req.user.account_id;
  const intakeDump = [];

  try {
    const intakeFullForm = await intakeFullFormRepository.find({
      where: { account_id, deleted_at: null },
      relations: [
        'admissionInformation',
        'clientInformation',
        'fatherContactInformation',
        'motherContactInformation',
        'schoolContactInformation',
        'moreAboutInformation',
        'medicalInformation',
        'referralInformation',
        'intakeInformation',
        'emergencyContactInformation',
        'serviceCoordinatorInformation',
      ],
    });

    let tempIntake = {};

    for (let i = 0; i < intakeFullForm.length; i++) {
      tempIntake = { ...intakeFullForm[i] };
      if (intakeFullForm[i].admissionInformation) {
        const admission_information_id = intakeFullForm[i].admissionInformation.id;
        const waiverService = await waiverServiceRepository.find({
          where: { admission_information_id, deleted_at: null },
        });
        tempIntake['waiverService'] = waiverService;
      }
      if (intakeFullForm[i].intakeInformation) {
        const intake_information_id = intakeFullForm[i].intakeInformation.id;
        const peoplePresent = await peoplePresentInformationRepository.find({
          where: { intake_information_id, deleted_at: null },
        });
        tempIntake['peoplePresent'] = peoplePresent;
      }
      intakeDump.push(tempIntake);
    }

    return res.customSuccess(200, 'Intake Full Form successfully retrieved.', intakeDump);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
