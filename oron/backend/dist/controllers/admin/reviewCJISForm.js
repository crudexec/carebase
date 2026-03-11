"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewCJISForm = void 0;
const typeorm_1 = require("typeorm");
const cjisFullForm_1 = require("orm/entities/CJISForm/cjisFullForm");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ReviewCJISForm = async (req, res, next) => {
    const cjisFormRepository = (0, typeorm_1.getRepository)(cjisFullForm_1.CJISFullForm);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    const { review_notes } = req.body;
    try {
        const cjisForm = await cjisFormRepository.findOne({ where: { id: form_id } });
        if (!cjisForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `CJIS Form not found.`, ['CJIS Form not found.']);
            return next(customError);
        }
        const user = await userRepository.findOne({ where: { id: cjisForm.user_id } });
        await cjisFormRepository.update({ id: form_id }, { status: genericEnums_1.Status.REVIEWED, review_notes });
        await (0, emailService_1.SendReviewEmail)(user.first_name, `CJIS Form`, review_notes, String(user.email));
        return res.customSuccess(200, 'CJIS Form successfully reviewed', cjisForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error reviewing CJIS form', null, err);
        return next(customError);
    }
};
exports.ReviewCJISForm = ReviewCJISForm;
//# sourceMappingURL=reviewCJISForm.js.map