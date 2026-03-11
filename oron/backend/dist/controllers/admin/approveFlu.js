"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveFluForm = void 0;
const typeorm_1 = require("typeorm");
const fluFullForm_1 = require("orm/entities/FluForm/fluFullForm");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ApproveFluForm = async (req, res, next) => {
    const fluFullFormRepository = (0, typeorm_1.getRepository)(fluFullForm_1.FluFullForm);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    try {
        const fluFullForm = await fluFullFormRepository.findOne({ where: { id: form_id } });
        if (!fluFullForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Flu Full Form not found.`, ['Flu Full Form not found.']);
            return next(customError);
        }
        const user = await userRepository.findOne({ where: { id: fluFullForm.user_id } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', `User not found.`, ['User not found.']);
            return next(customError);
        }
        await fluFullFormRepository.update({ id: form_id }, { status: genericEnums_1.Status.APPROVED });
        await (0, emailService_1.sendApproveMail)(user.first_name, `Flu Full Form`, String(user.email));
        return res.customSuccess(200, 'User BioData successfully approved.', fluFullForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.ApproveFluForm = ApproveFluForm;
//# sourceMappingURL=approveFlu.js.map