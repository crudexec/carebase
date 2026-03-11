"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editEmployeeInformation = void 0;
const typeorm_1 = require("typeorm");
const cjisEmployeeInformation_1 = require("orm/entities/CJISForm/cjisEmployeeInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editEmployeeInformation = async (req, res, next) => {
    let { first_name, last_name, date_of_hire, employee_id, job_title } = req.body;
    try {
        const cjisEmployeeInformationRepository = (0, typeorm_1.getRepository)(cjisEmployeeInformation_1.CJISEmployeeInformation);
        const user_id = req.user.id;
        const cjisEmployeeInformation = await cjisEmployeeInformationRepository.findOne({ where: { user_id } });
        if (!cjisEmployeeInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'CJIS Employee Information does not exist', [
                `CJIS Employee Information does not exist`,
            ]);
            return next(customError);
        }
        first_name = first_name ?? cjisEmployeeInformation.first_name;
        last_name = last_name ?? cjisEmployeeInformation.last_name;
        date_of_hire = date_of_hire ?? cjisEmployeeInformation.date_of_hire;
        employee_id = employee_id ?? cjisEmployeeInformation.employee_id;
        job_title = job_title ?? cjisEmployeeInformation.job_title;
        const newCJISEmployeeInformation = new cjisEmployeeInformation_1.CJISEmployeeInformation();
        newCJISEmployeeInformation.first_name = first_name;
        newCJISEmployeeInformation.last_name = last_name;
        newCJISEmployeeInformation.date_of_hire = date_of_hire;
        newCJISEmployeeInformation.employee_id = employee_id;
        newCJISEmployeeInformation.job_title = job_title;
        await cjisEmployeeInformationRepository.update(cjisEmployeeInformation.id, newCJISEmployeeInformation);
        return res.customSuccess(200, 'CJIS Employee Information successfully updated.', newCJISEmployeeInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editEmployeeInformation = editEmployeeInformation;
//# sourceMappingURL=editEmployeeInformation.js.map