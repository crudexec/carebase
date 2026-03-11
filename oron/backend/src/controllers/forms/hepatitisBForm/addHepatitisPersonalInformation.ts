import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { HepatitisBFullForm } from 'orm/entities/HepatitisBForm/HepatitisFullForm';
import { PersonalInformationHepatitisBForm } from 'orm/entities/HepatitisBForm/personalInformation';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addHepatitisBPersonalInformation = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  const { first_name, last_name, job_title, date_of_filling_form } = req.body;
  const HepatitisBFullFormRepository = getRepository(HepatitisBFullForm);
  const HepatitisBPersonalInformationRepository = getRepository(PersonalInformationHepatitisBForm);
  const user_id = req.user.id;

  try {
    const personalInformation = await HepatitisBPersonalInformationRepository.findOne({ where: { user_id } });
    if (personalInformation) {
      const customError = new CustomError(400, 'General', 'Personal information already exists', [
        `Personal information already exists`,
      ]);
      return next(customError);
    }
    const newpersonalInformation = new PersonalInformationHepatitisBForm();

    newpersonalInformation.first_name = first_name;
    newpersonalInformation.last_name = last_name;
    newpersonalInformation.job_title = job_title;
    newpersonalInformation.date_of_filling_form = date_of_filling_form;
    newpersonalInformation.user_id = user_id;

    const savedPersonalInformation = await HepatitisBPersonalInformationRepository.save(newpersonalInformation);

    if (savedPersonalInformation) {
      const attestationForm = await HepatitisBFullFormRepository.findOne({ where: { user_id } });
      if (attestationForm) {
        attestationForm.personal_information_id = savedPersonalInformation.id;
        attestationForm.status = Status.IN_PROGRESS;
        await HepatitisBFullFormRepository.save(attestationForm);
      } else {
        const newAttestationForm = new HepatitisBFullForm();
        newAttestationForm.user_id = user_id;
        newAttestationForm.personal_information_id = savedPersonalInformation.id;
        newAttestationForm.status = Status.IN_PROGRESS;
        await HepatitisBFullFormRepository.save(newAttestationForm);
      }
    }

    return res.customSuccess(200, ' Personal Information successfully created.', savedPersonalInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
