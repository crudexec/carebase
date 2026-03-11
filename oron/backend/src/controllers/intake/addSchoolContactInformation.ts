import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { SchoolContactInformation } from 'orm/entities/IntakeForm/schoolContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addSchoolContactInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { name_of_school, school_address, phone, school_email, contact_person, intake_full_id } = req.body;

  try {
    const schoolContactInformationRepository = getRepository(SchoolContactInformation);
    const intakeFullFormRepository = getRepository(IntakeFullForm);
    const user_id = req.user.id;
    const schoolContactInformation = await schoolContactInformationRepository.findOne({ where: { user_id } });

    if (schoolContactInformation) {
      const customError = new CustomError(400, 'General', 'School Contact Information already exists', [
        `School Contact Information already exists`,
      ]);
      return next(customError);
    }

    const newSchoolContactInformation = new SchoolContactInformation();
    newSchoolContactInformation.name_of_school = name_of_school;
    newSchoolContactInformation.school_address = school_address;
    newSchoolContactInformation.phone = phone;
    newSchoolContactInformation.school_email = school_email;
    newSchoolContactInformation.contact_person = contact_person;
    newSchoolContactInformation.registered_by = user_id;

    const savedSchoolContactInformation = await schoolContactInformationRepository.save(newSchoolContactInformation);

    if (savedSchoolContactInformation) {
      const newIntakeFullForm = new IntakeFullForm();

      const alreadyExistingIntakeFullForm = await intakeFullFormRepository.findOne({
        where: { id: intake_full_id, deleted_at: null },
      });

      if (alreadyExistingIntakeFullForm) {
        newIntakeFullForm.school_contact_information_id = savedSchoolContactInformation.id;
        await intakeFullFormRepository.update(alreadyExistingIntakeFullForm.id, newIntakeFullForm);
      }
    }

    return res.customSuccess(200, 'School Contact Information successfully created.', savedSchoolContactInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error', null, err);
    return next(customError);
  }
};
