import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeEmergencyContactInformation } from 'orm/entities/IntakeForm/emergencyContactInformation';
import { FatherContactInformation } from 'orm/entities/IntakeForm/fatherContactInformation';
import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { MotherContactInformation } from 'orm/entities/IntakeForm/motherContactInformation';
import { SchoolContactInformation } from 'orm/entities/IntakeForm/schoolContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addContactInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const fatherContactInformationRepository = getRepository(FatherContactInformation);
  const motherInformationRepository = getRepository(MotherContactInformation);
  const emergencyContactInformationRepository = getRepository(IntakeEmergencyContactInformation);
  const schoolContactInformationRepository = getRepository(SchoolContactInformation);
  const intakeFullFormRepository = getRepository(IntakeFullForm);
  const user_id = req.user.id;
  try {
    const {
      father_first_name,
      father_last_name,
      father_relationship,
      father_email,
      father_street_number_and_house_address,
      father_country,
      father_state,
      father_city,
      father_zip_code,
      father_apartment_number,
      father_phone,
      father_home_phone_number,
      father_work_phone_number,
      mother_first_name,
      mother_last_name,
      mother_relationship,
      mother_email,
      mother_street_number_and_house_address,
      mother_country,
      mother_state,
      mother_city,
      mother_zip_code,
      mother_apartment_number,
      mother_phone,
      mother_home_phone_number,
      mother_work_phone_number,
      emergency_first_name,
      emergency_last_name,
      emergency_relationship,
      emergency_email,
      emergency_street_number_and_house_address,
      emergency_country,
      emergency_state,
      emergency_city,
      emergency_zip_code,
      emergency_apartment_number,
      emergency_phone,
      emergency_home_phone_number,
      emergency_work_phone_number,
      name_of_school,
      school_address,
      school_phone,
      school_email,
      school_contact_person,
      intake_information_id,
      intake_full_id,
    } = req.body;

    const newFatherContactInformation = new FatherContactInformation();
    newFatherContactInformation.first_name = father_first_name;
    newFatherContactInformation.last_name = father_last_name;
    newFatherContactInformation.relationship = father_relationship;
    newFatherContactInformation.email = father_email;
    newFatherContactInformation.street_number_and_house_address = father_street_number_and_house_address;
    newFatherContactInformation.country = father_country;
    newFatherContactInformation.state = father_state;
    newFatherContactInformation.city = father_city;
    newFatherContactInformation.zip_code = father_zip_code;
    newFatherContactInformation.apartment_number = father_apartment_number;
    newFatherContactInformation.phone = father_phone;
    newFatherContactInformation.home_phone_number = father_home_phone_number;
    newFatherContactInformation.work_phone_number = father_work_phone_number;
    newFatherContactInformation.registered_by = user_id;
    const savedFatherInformation = await fatherContactInformationRepository.save(newFatherContactInformation);

    const newMotherInformation = new MotherContactInformation();
    newMotherInformation.first_name = mother_first_name;
    newMotherInformation.last_name = mother_last_name;
    newMotherInformation.relationship = mother_relationship;
    newMotherInformation.email = mother_email;
    newMotherInformation.street_number_and_house_address = mother_street_number_and_house_address;
    newMotherInformation.country = mother_country;
    newMotherInformation.state = mother_state;
    newMotherInformation.city = mother_city;
    newMotherInformation.zip_code = mother_zip_code;
    newMotherInformation.apartment_number = mother_apartment_number;
    newMotherInformation.phone = mother_phone;
    newMotherInformation.home_phone_number = mother_home_phone_number;
    newMotherInformation.work_phone_number = mother_work_phone_number;
    newMotherInformation.registered_by = user_id;
    const savedMotherInformation = await motherInformationRepository.save(newMotherInformation);

    const newEmergencyContactInformation = new IntakeEmergencyContactInformation();

    newEmergencyContactInformation.first_name = emergency_first_name;
    newEmergencyContactInformation.last_name = emergency_last_name;
    newEmergencyContactInformation.relationship = emergency_relationship;
    newEmergencyContactInformation.email = emergency_email;
    newEmergencyContactInformation.street_number_and_house_address = emergency_street_number_and_house_address;
    newEmergencyContactInformation.country = emergency_country;
    newEmergencyContactInformation.state = emergency_state;
    newEmergencyContactInformation.city = emergency_city;
    newEmergencyContactInformation.zip_code = emergency_zip_code;
    newEmergencyContactInformation.apartment_number = emergency_apartment_number;
    newEmergencyContactInformation.phone = emergency_phone;
    newEmergencyContactInformation.home_phone_number = emergency_home_phone_number;
    newEmergencyContactInformation.work_phone_number = emergency_work_phone_number;
    newEmergencyContactInformation.registered_by = user_id;

    const savedEmergencyContactInformation = await emergencyContactInformationRepository.save(
      newEmergencyContactInformation,
    );

    const newSchoolContactInformation = new SchoolContactInformation();
    newSchoolContactInformation.name_of_school = name_of_school;
    newSchoolContactInformation.school_address = school_address;
    newSchoolContactInformation.phone = school_phone;
    newSchoolContactInformation.school_email = school_email;
    newSchoolContactInformation.contact_person = school_contact_person;
    newSchoolContactInformation.registered_by = user_id;

    const savedSchoolContactInformation = await schoolContactInformationRepository.save(newSchoolContactInformation);

    if (
      savedFatherInformation &&
      savedMotherInformation &&
      savedEmergencyContactInformation &&
      savedSchoolContactInformation
    ) {
      const newIntakeFullForm = new IntakeFullForm();
      const alreadyExistIntakeFullForm = await intakeFullFormRepository.findOne({
        where: { id: intake_full_id },
      });

      if (alreadyExistIntakeFullForm) {
        newIntakeFullForm.father_contact_information_id = savedFatherInformation.id;
        newIntakeFullForm.mother_contact_information_id = savedMotherInformation.id;
        newIntakeFullForm.emergency_contact_information_id = savedEmergencyContactInformation.id;
        newIntakeFullForm.school_contact_information_id = savedSchoolContactInformation.id;
        await intakeFullFormRepository.update(alreadyExistIntakeFullForm.id, newIntakeFullForm);
      }
    }

    return res.customSuccess(200, 'Contact Information successfully created.', {
      father: savedFatherInformation,
      mother: savedMotherInformation,
      emergency: savedEmergencyContactInformation,
      school: savedSchoolContactInformation,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
