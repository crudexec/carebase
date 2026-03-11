import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PersonalInformationHepatitisBForm } from 'orm/entities/HepatitisBForm/personalInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editHepatitisBPersonalInformation = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  let { first_name, last_name, job_title } = req.body;
  const HepatitisBPersonalInformationRepository = getRepository(PersonalInformationHepatitisBForm);
  const user_id = req.user.id;

  try {
    const personalInformation = await HepatitisBPersonalInformationRepository.findOne({ where: { user_id } });
    if (personalInformation) {
      first_name = first_name || personalInformation.first_name;
      last_name = last_name || personalInformation.last_name;
      job_title = job_title || personalInformation.job_title;

      const newpersonalInformation = new PersonalInformationHepatitisBForm();

      newpersonalInformation.first_name = first_name;
      newpersonalInformation.last_name = last_name;
      newpersonalInformation.job_title = job_title;

      await HepatitisBPersonalInformationRepository.update(personalInformation.id, newpersonalInformation);

      return res.customSuccess(200, 'Hepatitis B Personal Employee Form Successfully updated.', newpersonalInformation);
    } else {
      const customError = new CustomError(400, 'General', 'Personal information does not exist', [
        `Personal information does not exist`,
      ]);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
