"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewDemographicForm = void 0;
const typeorm_1 = require("typeorm");
const personalInformation_1 = require("orm/entities/EmployeeDemographicForm/personalInformation");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ReviewDemographicForm = async (req, res, next) => {
    const employeePersonalInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.EmployeePersonalInformation);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    const { review_notes } = req.body;
    try {
        const employeeForm = await employeePersonalInformationRepository.findOne({ where: { id: form_id } });
        if (!employeeForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Employee  Form not found.`, [
                'Employee demographic Form not found.',
            ]);
            return next(customError);
        }
        const user = await userRepository.findOne({ where: { id: employeeForm.user_id } });
        await employeePersonalInformationRepository.update({ id: form_id }, { status: genericEnums_1.Status.REVIEWED, review_notes });
        await (0, emailService_1.SendReviewEmail)(employeeForm.first_name, `Employee Demographic Form`, review_notes, String(user.email));
        return res.customSuccess(200, 'Employee Demographic Form successfully reviewed.', employeeForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.ReviewDemographicForm = ReviewDemographicForm;
//# sourceMappingURL=reviewEmployeeDemographic.js.map