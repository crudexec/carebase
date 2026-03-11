"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveReferenceForm = void 0;
const typeorm_1 = require("typeorm");
const reference_1 = require("orm/entities/ReferenceForm/reference");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ApproveReferenceForm = async (req, res, next) => {
    const referenceFormRepository = (0, typeorm_1.getRepository)(reference_1.ReferenceForm);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    try {
        const referenceForm = await referenceFormRepository.findOne({ where: { id: form_id } });
        if (!referenceForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Reference Form not found.`, ['Reference Form not found.']);
            return next(customError);
        }
        await referenceFormRepository.update({ id: form_id }, { status: genericEnums_1.Status.APPROVED });
        const user = await userRepository.findOne({ where: { id: referenceForm.user_id } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', `User not found.`, ['User not found.']);
            return next(customError);
        }
        await (0, emailService_1.sendApproveMail)(user.first_name, `Reference Form`, String(user.email));
        return res.customSuccess(200, 'Reference Form successfully approved.', referenceForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Approving Reference Form', null, err);
        return next(customError);
    }
};
exports.ApproveReferenceForm = ApproveReferenceForm;
//# sourceMappingURL=approveReferenceForms.js.map