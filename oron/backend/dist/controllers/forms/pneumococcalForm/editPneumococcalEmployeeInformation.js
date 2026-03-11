"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPneumococcalEmployeeInformation = void 0;
const typeorm_1 = require("typeorm");
const employeeInformationForm_1 = require("orm/entities/PneumoccalVaccinationForm/employeeInformationForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editPneumococcalEmployeeInformation = async (req, res, next) => {
    let { first_name, last_name, job_title } = req.body;
    const employeeInformationRepository = (0, typeorm_1.getRepository)(employeeInformationForm_1.EmployeeInformation);
    const user_id = req.user.id;
    try {
        const employeeInformation = await employeeInformationRepository.findOne({ where: { user_id } });
        if (employeeInformation) {
            first_name = first_name ?? employeeInformation.first_name;
            last_name = last_name ?? employeeInformation.last_name;
            job_title = job_title ?? employeeInformation.job_title;
            const newEmployeeInformation = new employeeInformationForm_1.EmployeeInformation();
            newEmployeeInformation.first_name = first_name;
            newEmployeeInformation.last_name = last_name;
            newEmployeeInformation.job_title = job_title;
            await employeeInformationRepository.update(employeeInformation.id, newEmployeeInformation);
            return res.customSuccess(200, 'User employee information successfully updated for the pneumococcal form.', newEmployeeInformation);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Employee personal information does not exist for the pneumococcal form', [`Employee form does not exist`]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editPneumococcalEmployeeInformation = editPneumococcalEmployeeInformation;
//# sourceMappingURL=editPneumococcalEmployeeInformation.js.map