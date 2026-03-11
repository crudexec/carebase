"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveCJISForm = void 0;
const typeorm_1 = require("typeorm");
const cjisFullForm_1 = require("orm/entities/CJISForm/cjisFullForm");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ApproveCJISForm = async (req, res, next) => {
    const CJISFullFormRepository = (0, typeorm_1.getRepository)(cjisFullForm_1.CJISFullForm);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    try {
        const CJISForm = await CJISFullFormRepository.findOne({ where: { id: form_id } });
        if (!CJISForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `CJIS Form not found.`, ['CJIS Form not found.']);
            return next(customError);
        }
        await CJISFullFormRepository.update({ id: form_id }, { status: genericEnums_1.Status.APPROVED });
        const user = await userRepository.findOne({ where: { id: CJISForm.user_id } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', `User not found.`, ['User not found.']);
            return next(customError);
        }
        await (0, emailService_1.sendApproveMail)(user.first_name, `CJIS Form`, String(user.email));
        return res.customSuccess(200, 'CJIS Form successfully approved.', CJISForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Approving CJIS Form', null, err);
        return next(customError);
    }
};
exports.ApproveCJISForm = ApproveCJISForm;
//# sourceMappingURL=approveCJISForm.js.map