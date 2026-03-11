import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeInformation } from 'orm/entities/IntakeForm/intakeInformation';
import { PeoplePresentInformation } from 'orm/entities/IntakeForm/peoplePresent';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveIntakeInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const intakeInformationRepository = getRepository(IntakeInformation);
  const user_id = req.user.id;

  try {
    const intakeInformation = await intakeInformationRepository.findOne({ where: { user_id } });
    if (intakeInformation) {
      const people_present = await getRepository(PeoplePresentInformation).find({
        where: { intake_information_id: intakeInformation.id },
      });
      return res.customSuccess(200, 'Intake Information successfully retrieved.', {
        intakeInformation,
        people_present,
      });
    } else {
      return res.customSuccess(200, 'Intake Information has not been filled', null);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
