"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agreeHandbook = void 0;
const typeorm_1 = require("typeorm");
const employeeHandBook_1 = require("orm/entities/employeeHandBook");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const agreeHandbook = async (req, res, next) => {
    try {
        const employeeHandbookRepository = (0, typeorm_1.getRepository)(employeeHandBook_1.EmployeeHandbook);
        const user_id = req.user.id;
        const { employee_first_name, employee_last_name, employee_email, document_url, date_of_agreement } = req.body;
        const agreedHandbook = new employeeHandBook_1.EmployeeHandbook();
        const existingAgreement = await employeeHandbookRepository.findOne({ where: { user_id } });
        if (existingAgreement) {
            return res.customSuccess(200, 'Employee Handbook already agreed.', existingAgreement);
        }
        agreedHandbook.employee_first_name = employee_first_name;
        agreedHandbook.employee_last_name = employee_last_name;
        agreedHandbook.employee_email = employee_email;
        agreedHandbook.document_url = document_url;
        agreedHandbook.date_of_agreement = date_of_agreement;
        agreedHandbook.user_id = user_id;
        const savedEmployeeHandbook = await employeeHandbookRepository.save(agreedHandbook);
        return res.customSuccess(200, 'Employee Handbook successfully agreed.', savedEmployeeHandbook);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Downloading Handbook', null, err);
        return next(customError);
    }
};
exports.agreeHandbook = agreeHandbook;
//# sourceMappingURL=agreeHandbook.js.map