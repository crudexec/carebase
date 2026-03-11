"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveHepatitisForm = void 0;
const typeorm_1 = require("typeorm");
const HepatitisFullForm_1 = require("orm/entities/HepatitisBForm/HepatitisFullForm");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ApproveHepatitisForm = async (req, res, next) => {
    const hepatitisBFormRepository = (0, typeorm_1.getRepository)(HepatitisFullForm_1.HepatitisBFullForm);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    try {
        const hepatitisBForm = await hepatitisBFormRepository.findOne({ where: { id: form_id } });
        if (!hepatitisBForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Hepatitis Form not found.`, ['Hepatitis Form not found.']);
            return next(customError);
        }
        const user = await userRepository.findOne({ where: { id: hepatitisBForm.user_id } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', `User not found.`, ['User not found.']);
            return next(customError);
        }
        await hepatitisBFormRepository.update({ id: form_id }, { status: genericEnums_1.Status.APPROVED });
        await (0, emailService_1.sendApproveMail)(user.first_name, `Hepatitis B Form`, String(user.email));
        return res.customSuccess(200, 'Hepatitis Form successfully approved.', hepatitisBForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.ApproveHepatitisForm = ApproveHepatitisForm;
//# sourceMappingURL=approveHepatitis.js.map