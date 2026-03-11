"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveHandbookAgreement = void 0;
const typeorm_1 = require("typeorm");
const employeeHandBook_1 = require("orm/entities/employeeHandBook");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveHandbookAgreement = async (req, res, next) => {
    try {
        const employeeHandbookRepository = (0, typeorm_1.getRepository)(employeeHandBook_1.EmployeeHandbook);
        const user_id = req.user.id;
        const existingAgreement = await employeeHandbookRepository.findOne({ where: { user_id } });
        if (!existingAgreement) {
            return res.customSuccess(200, 'Employee has not agreed to the handbook.', null);
        }
        return res.customSuccess(200, 'Employee Handbook already agreed.', existingAgreement);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Downloading Handbook', null, err);
        return next(customError);
    }
};
exports.retrieveHandbookAgreement = retrieveHandbookAgreement;
//# sourceMappingURL=retrieveHandBookAgreement.js.map