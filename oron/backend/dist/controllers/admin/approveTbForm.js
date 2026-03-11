"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveTbForm = void 0;
const typeorm_1 = require("typeorm");
const tuberculosisFullForm_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ApproveTbForm = async (req, res, next) => {
    const tbFullFormRepository = (0, typeorm_1.getRepository)(tuberculosisFullForm_1.TuberculosisFullForm);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    try {
        const tbFullForm = await tbFullFormRepository.findOne({ where: { id: form_id } });
        if (!tbFullForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Tuberculosis Full Form not found.`, [
                'Tuberculosis Full Form not found.',
            ]);
            return next(customError);
        }
        await tbFullFormRepository.update({ id: form_id }, { status: genericEnums_1.Status.APPROVED });
        const user = await userRepository.findOne({ where: { id: tbFullForm.owner } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', `User not found.`, ['User not found.']);
            return next(customError);
        }
        await (0, emailService_1.sendApproveMail)(user.first_name, `Tuberculosis Form`, String(user.email));
        return res.customSuccess(200, 'Tuberculosis Full Form successfully approved.', tbFullForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.ApproveTbForm = ApproveTbForm;
//# sourceMappingURL=approveTbForm.js.map