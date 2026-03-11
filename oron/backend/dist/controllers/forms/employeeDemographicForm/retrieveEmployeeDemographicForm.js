"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveEmployeeDemographicForm = void 0;
const typeorm_1 = require("typeorm");
const emergencyDemographicForm_1 = require("orm/entities/EmployeeDemographicForm/emergencyDemographicForm");
const personalInformation_1 = require("orm/entities/EmployeeDemographicForm/personalInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveEmployeeDemographicForm = async (req, res, next) => {
    const emergencyContactInformationRepository = (0, typeorm_1.getRepository)(emergencyDemographicForm_1.EmergencyContactInformation);
    const employeeDemographicRepository = (0, typeorm_1.getRepository)(personalInformation_1.EmployeePersonalInformation);
    const user_id = req.user.id;
    try {
        const emergencyContactInformation = await emergencyContactInformationRepository.findOne({ where: { user_id } });
        const employeeDemographicInformation = await employeeDemographicRepository.findOne({ where: { user_id } });
        return res.customSuccess(200, 'User Employee Demographic form data found', {
            emergencyContactInformation,
            employeeDemographicInformation,
            status: employeeDemographicInformation.status,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveEmployeeDemographicForm = retrieveEmployeeDemographicForm;
//# sourceMappingURL=retrieveEmployeeDemographicForm.js.map