"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editContactInformation = void 0;
const typeorm_1 = require("typeorm");
const emergencyContactInformation_1 = require("orm/entities/IntakeForm/emergencyContactInformation");
const fatherContactInformation_1 = require("orm/entities/IntakeForm/fatherContactInformation");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const motherContactInformation_1 = require("orm/entities/IntakeForm/motherContactInformation");
const schoolContactInformation_1 = require("orm/entities/IntakeForm/schoolContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editContactInformation = async (req, res, next) => {
    const fatherContactInformationRepository = (0, typeorm_1.getRepository)(fatherContactInformation_1.FatherContactInformation);
    const motherInformationRepository = (0, typeorm_1.getRepository)(motherContactInformation_1.MotherContactInformation);
    const emergencyContactInformationRepository = (0, typeorm_1.getRepository)(emergencyContactInformation_1.IntakeEmergencyContactInformation);
    const schoolContactInformationRepository = (0, typeorm_1.getRepository)(schoolContactInformation_1.SchoolContactInformation);
    const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
    const user_id = req.user.id;
    const form_id = req.params.form_id;
    try {
        let { father_first_name, father_last_name, father_relationship, father_email, father_street_number_and_house_address, father_country, father_state, father_city, father_zip_code, father_apartment_number, father_phone, father_home_phone_number, father_work_phone_number, mother_first_name, mother_last_name, mother_relationship, mother_email, mother_street_number_and_house_address, mother_country, mother_state, mother_city, mother_zip_code, mother_apartment_number, mother_phone, mother_home_phone_number, mother_work_phone_number, emergency_first_name, emergency_last_name, emergency_relationship, emergency_email, emergency_street_number_and_house_address, emergency_country, emergency_state, emergency_city, emergency_zip_code, emergency_apartment_number, emergency_phone, emergency_home_phone_number, emergency_work_phone_number, name_of_school, school_address, school_phone, school_email, school_contact_person, } = req.body;
        const intakeFullForm = await intakeFullFormRepository.findOne({ where: { id: form_id } });
        if (!intakeFullForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Intake Full Form does not exist', [
                `Intake Full Form does not exist`,
            ]);
            return next(customError);
        }
        const fatherInformation = await fatherContactInformationRepository.findOne({
            where: { id: intakeFullForm.father_contact_information_id },
        });
        if (!fatherInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Father Information does not exist', [
                `Father Information does not exist`,
            ]);
            return next(customError);
        }
        father_first_name = father_first_name ?? fatherInformation.first_name;
        father_last_name = father_last_name ?? fatherInformation.last_name;
        father_relationship = father_relationship ?? fatherInformation.relationship;
        father_email = father_email ?? fatherInformation.email;
        father_street_number_and_house_address =
            father_street_number_and_house_address ?? fatherInformation.street_number_and_house_address;
        father_country = father_country ?? fatherInformation.country;
        father_state = father_state ?? fatherInformation.state;
        father_city = father_city ?? fatherInformation.city;
        father_zip_code = father_zip_code ?? fatherInformation.zip_code;
        father_apartment_number = father_apartment_number ?? fatherInformation.apartment_number;
        father_phone = father_phone ?? fatherInformation.phone;
        father_home_phone_number = father_home_phone_number ?? fatherInformation.home_phone_number;
        father_work_phone_number = father_work_phone_number ?? fatherInformation.work_phone_number;
        const newFatherContactInformation = new fatherContactInformation_1.FatherContactInformation();
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
        await fatherContactInformationRepository.update({ id: fatherInformation.id }, newFatherContactInformation);
        const motherInformation = await motherInformationRepository.findOne({
            where: { id: intakeFullForm.mother_contact_information_id },
        });
        if (!motherInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Mother Information does not exist', [
                `Mother Information does not exist`,
            ]);
            return next(customError);
        }
        mother_first_name = mother_first_name ?? motherInformation.first_name;
        mother_last_name = mother_last_name ?? motherInformation.last_name;
        mother_relationship = mother_relationship ?? motherInformation.relationship;
        mother_email = mother_email ?? motherInformation.email;
        mother_street_number_and_house_address =
            mother_street_number_and_house_address ?? motherInformation.street_number_and_house_address;
        mother_country = mother_country ?? motherInformation.country;
        mother_state = mother_state ?? motherInformation.state;
        mother_city = mother_city ?? motherInformation.city;
        mother_zip_code = mother_zip_code ?? motherInformation.zip_code;
        mother_apartment_number = mother_apartment_number ?? motherInformation.apartment_number;
        mother_phone = mother_phone ?? motherInformation.phone;
        mother_home_phone_number = mother_home_phone_number ?? motherInformation.home_phone_number;
        mother_work_phone_number = mother_work_phone_number ?? motherInformation.work_phone_number;
        const newMotherInformation = new motherContactInformation_1.MotherContactInformation();
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
        await motherInformationRepository.update({ id: motherInformation.id }, newMotherInformation);
        const emergencyInformation = await emergencyContactInformationRepository.findOne({
            where: { id: intakeFullForm.emergency_contact_information_id },
        });
        if (!emergencyInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Emergency Information does not exist', [
                `Emergency Information does not exist`,
            ]);
            return next(customError);
        }
        emergency_first_name = emergency_first_name ?? emergencyInformation.first_name;
        emergency_last_name = emergency_last_name ?? emergencyInformation.last_name;
        emergency_relationship = emergency_relationship ?? emergencyInformation.relationship;
        emergency_email = emergency_email ?? emergencyInformation.email;
        emergency_street_number_and_house_address =
            emergency_street_number_and_house_address ?? emergencyInformation.street_number_and_house_address;
        emergency_country = emergency_country ?? emergencyInformation.country;
        emergency_state = emergency_state ?? emergencyInformation.state;
        emergency_city = emergency_city ?? emergencyInformation.city;
        emergency_zip_code = emergency_zip_code ?? emergencyInformation.zip_code;
        emergency_apartment_number = emergency_apartment_number ?? emergencyInformation.apartment_number;
        emergency_phone = emergency_phone ?? emergencyInformation.phone;
        emergency_home_phone_number = emergency_home_phone_number ?? emergencyInformation.home_phone_number;
        emergency_work_phone_number = emergency_work_phone_number ?? emergencyInformation.work_phone_number;
        const newEmergencyContactInformation = new emergencyContactInformation_1.IntakeEmergencyContactInformation();
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
        await emergencyContactInformationRepository.update({ id: emergencyInformation.id }, newEmergencyContactInformation);
        const schoolInformation = await schoolContactInformationRepository.findOne({
            where: { id: intakeFullForm.school_contact_information_id },
        });
        if (!schoolInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'School Information does not exist', [
                `School Information does not exist`,
            ]);
            return next(customError);
        }
        name_of_school = name_of_school ?? schoolInformation.name_of_school;
        school_address = school_address ?? schoolInformation.school_address;
        school_phone = school_phone ?? schoolInformation.phone;
        school_email = school_email ?? schoolInformation.school_email;
        school_contact_person = school_contact_person ?? schoolInformation.contact_person;
        const newSchoolContactInformation = new schoolContactInformation_1.SchoolContactInformation();
        newSchoolContactInformation.name_of_school = name_of_school;
        newSchoolContactInformation.school_address = school_address;
        newSchoolContactInformation.phone = school_phone;
        newSchoolContactInformation.school_email = school_email;
        newSchoolContactInformation.contact_person = school_contact_person;
        await schoolContactInformationRepository.update({ id: schoolInformation.id }, newSchoolContactInformation);
        return res.customSuccess(200, 'Contact Information successfully updated.', {
            father: newFatherContactInformation,
            mother: newMotherInformation,
            emergency: newEmergencyContactInformation,
            school: newSchoolContactInformation,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editContactInformation = editContactInformation;
//# sourceMappingURL=editContactInformation.js.map