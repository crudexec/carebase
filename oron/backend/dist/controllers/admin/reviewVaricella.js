"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewVaricellaForm = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const varicellaFullForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaFullForm");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ReviewVaricellaForm = async (req, res, next) => {
    const varicellaFullFormRepository = await (0, typeorm_1.getRepository)(varicellaFullForm_1.VaricellaFullForm);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    const { review_notes } = req.body;
    try {
        const varicellaForm = await varicellaFullFormRepository.findOne({ where: { id: form_id } });
        if (!varicellaForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Varicella Form not found.`, ['Varicella Form not found.']);
            return next(customError);
        }
        const user = await userRepository.findOne({ where: { id: varicellaForm.user_id } });
        await varicellaFullFormRepository.update({ id: form_id }, { status: genericEnums_1.Status.REVIEWED, review_notes });
        await (0, emailService_1.SendReviewEmail)(user.first_name, `Varicella Form`, review_notes, String(user.email));
        return res.customSuccess(200, 'Varicella Form successfully reviewed.', varicellaForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.ReviewVaricellaForm = ReviewVaricellaForm;
//# sourceMappingURL=reviewVaricella.js.map