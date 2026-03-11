"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmergencyContactInformation = void 0;
const typeorm_1 = require("typeorm");
const emergencyDemographicForm_1 = require("orm/entities/EmployeeDemographicForm/emergencyDemographicForm");
const personalInformation_1 = require("orm/entities/EmployeeDemographicForm/personalInformation");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addEmergencyContactInformation = async (req, res, next) => {
    const { first_name, last_name, relationship_to_employee, street_address, phone, city, zip_code, state } = req.body;
    const emergencyContactInformationRepository = (0, typeorm_1.getRepository)(emergencyDemographicForm_1.EmergencyContactInformation);
    const employeeDemographicRepository = (0, typeorm_1.getRepository)(personalInformation_1.EmployeePersonalInformation);
    const user_id = req.user.id;
    try {
        const personalInformation = await emergencyContactInformationRepository.findOne({ where: { user_id } });
        if (personalInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Emergency contact information already exists', [
                `Emergency contact data already exists`,
            ]);
            return next(customError);
        }
        const newpersonalInformation = new emergencyDemographicForm_1.EmergencyContactInformation();
        newpersonalInformation.first_name = first_name;
        newpersonalInformation.last_name = last_name;
        newpersonalInformation.relationship_to_employee = relationship_to_employee;
        newpersonalInformation.phone = phone;
        newpersonalInformation.city = city;
        newpersonalInformation.street_address = street_address;
        newpersonalInformation.zip_code = zip_code;
        newpersonalInformation.state = state;
        newpersonalInformation.user_id = user_id;
        const savedPersonalInformation = await emergencyContactInformationRepository.save(newpersonalInformation);
        if (savedPersonalInformation) {
            const employee_personal_information = await employeeDemographicRepository.findOne({ where: { user_id } });
            if (employee_personal_information) {
                newpersonalInformation.employee_personal_information_id = employee_personal_information.id;
                await emergencyContactInformationRepository.update(savedPersonalInformation.id, newpersonalInformation);
                employee_personal_information.status = genericEnums_1.Status.IN_PROGRESS;
                await employeeDemographicRepository.update(employee_personal_information.id, employee_personal_information);
            }
        }
        return res.customSuccess(200, 'Emergency contact information successfully created.', savedPersonalInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addEmergencyContactInformation = addEmergencyContactInformation;
//# sourceMappingURL=addEmergencyContact.js.map