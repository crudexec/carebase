import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { SchoolContactInformation } from 'orm/entities/IntakeForm/schoolContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editSchoolContactInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { name_of_school, school_address, phone, school_email, contact_person } = req.body;

  try {
    const schoolContactInformationRepository = getRepository(SchoolContactInformation);
    const form_id = req.params.form_id;

    const schoolContactInformation = await schoolContactInformationRepository.findOne({ where: { id: form_id } });

    if (!schoolContactInformation) {
      const customError = new CustomError(400, 'General', 'School Contact Information does not exist', [
        `School Contact Information does not exist`,
      ]);
      return next(customError);
    }
    name_of_school = name_of_school ?? schoolContactInformation.name_of_school;
    school_address = school_address ?? schoolContactInformation.school_address;
    phone = phone ?? schoolContactInformation.phone;
    school_email = school_email ?? schoolContactInformation.school_email;
    contact_person = contact_person ?? schoolContactInformation.contact_person;

    const newSchoolContactInformation = new SchoolContactInformation();

    newSchoolContactInformation.name_of_school = name_of_school;
    newSchoolContactInformation.school_address = school_address;
    newSchoolContactInformation.phone = phone;
    newSchoolContactInformation.school_email = school_email;
    newSchoolContactInformation.contact_person = contact_person;

    await schoolContactInformationRepository.update({ id: schoolContactInformation.id }, newSchoolContactInformation);

    return res.customSuccess(200, 'School Contact Information successfully updated.', newSchoolContactInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error', null, err);
    return next(customError);
  }
};
