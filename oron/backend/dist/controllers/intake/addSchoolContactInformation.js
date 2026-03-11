"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSchoolContactInformation = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const schoolContactInformation_1 = require("orm/entities/IntakeForm/schoolContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addSchoolContactInformation = async (req, res, next) => {
    const { name_of_school, school_address, phone, school_email, contact_person, intake_full_id } = req.body;
    try {
        const schoolContactInformationRepository = (0, typeorm_1.getRepository)(schoolContactInformation_1.SchoolContactInformation);
        const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const user_id = req.user.id;
        const schoolContactInformation = await schoolContactInformationRepository.findOne({ where: { user_id } });
        if (schoolContactInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'School Contact Information already exists', [
                `School Contact Information already exists`,
            ]);
            return next(customError);
        }
        const newSchoolContactInformation = new schoolContactInformation_1.SchoolContactInformation();
        newSchoolContactInformation.name_of_school = name_of_school;
        newSchoolContactInformation.school_address = school_address;
        newSchoolContactInformation.phone = phone;
        newSchoolContactInformation.school_email = school_email;
        newSchoolContactInformation.contact_person = contact_person;
        newSchoolContactInformation.registered_by = user_id;
        const savedSchoolContactInformation = await schoolContactInformationRepository.save(newSchoolContactInformation);
        if (savedSchoolContactInformation) {
            const newIntakeFullForm = new intakeFullForm_1.IntakeFullForm();
            const alreadyExistingIntakeFullForm = await intakeFullFormRepository.findOne({
                where: { id: intake_full_id, deleted_at: null },
            });
            if (alreadyExistingIntakeFullForm) {
                newIntakeFullForm.school_contact_information_id = savedSchoolContactInformation.id;
                await intakeFullFormRepository.update(alreadyExistingIntakeFullForm.id, newIntakeFullForm);
            }
        }
        return res.customSuccess(200, 'School Contact Information successfully created.', savedSchoolContactInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error', null, err);
        return next(customError);
    }
};
exports.addSchoolContactInformation = addSchoolContactInformation;
//# sourceMappingURL=addSchoolContactInformation.js.map