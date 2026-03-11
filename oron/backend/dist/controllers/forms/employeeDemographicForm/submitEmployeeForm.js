"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitEmployeeDemographicForm = void 0;
const typeorm_1 = require("typeorm");
const personalInformation_1 = require("orm/entities/EmployeeDemographicForm/personalInformation");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitEmployeeDemographicForm = async (req, res, next) => {
    try {
        const demographicRepository = (0, typeorm_1.getRepository)(personalInformation_1.EmployeePersonalInformation);
        const user_id = req.user.id;
        const demographicForm = await demographicRepository.findOne({ where: { user_id } });
        if (!demographicForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Employee demographic form does not exist', [
                `Employee demographic form does not exist`,
            ]);
            return next(customError);
        }
        await demographicRepository.update(demographicForm.id, { status: genericEnums_1.Status.AWAITING_APPROVAL });
        return res.customSuccess(200, 'Employee demographic form successfully submitted.', demographicForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.submitEmployeeDemographicForm = submitEmployeeDemographicForm;
//# sourceMappingURL=submitEmployeeForm.js.map