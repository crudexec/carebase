"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editSchoolContactInformation = void 0;
const typeorm_1 = require("typeorm");
const schoolContactInformation_1 = require("orm/entities/IntakeForm/schoolContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editSchoolContactInformation = async (req, res, next) => {
    let { name_of_school, school_address, phone, school_email, contact_person } = req.body;
    try {
        const schoolContactInformationRepository = (0, typeorm_1.getRepository)(schoolContactInformation_1.SchoolContactInformation);
        const form_id = req.params.form_id;
        const schoolContactInformation = await schoolContactInformationRepository.findOne({ where: { id: form_id } });
        if (!schoolContactInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'School Contact Information does not exist', [
                `School Contact Information does not exist`,
            ]);
            return next(customError);
        }
        name_of_school = name_of_school ?? schoolContactInformation.name_of_school;
        school_address = school_address ?? schoolContactInformation.school_address;
        phone = phone ?? schoolContactInformation.phone;
        school_email = school_email ?? schoolContactInformation.school_email;
        contact_person = contact_person ?? schoolContactInformation.contact_person;
        const newSchoolContactInformation = new schoolContactInformation_1.SchoolContactInformation();
        newSchoolContactInformation.name_of_school = name_of_school;
        newSchoolContactInformation.school_address = school_address;
        newSchoolContactInformation.phone = phone;
        newSchoolContactInformation.school_email = school_email;
        newSchoolContactInformation.contact_person = contact_person;
        await schoolContactInformationRepository.update({ id: schoolContactInformation.id }, newSchoolContactInformation);
        return res.customSuccess(200, 'School Contact Information successfully updated.', newSchoolContactInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error', null, err);
        return next(customError);
    }
};
exports.editSchoolContactInformation = editSchoolContactInformation;
//# sourceMappingURL=editSchoolContactInformation.js.map