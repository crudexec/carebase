"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewI9Form = void 0;
const typeorm_1 = require("typeorm");
const i9form_1 = require("orm/entities/i9Form/i9form");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ReviewI9Form = async (req, res, next) => {
    const i9FormRepository = (0, typeorm_1.getRepository)(i9form_1.I9Form);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    const { review_notes } = req.body;
    try {
        const i9Form = await i9FormRepository.findOne({ where: { id: form_id } });
        if (!i9Form) {
            const customError = new CustomError_1.CustomError(404, 'General', `I9 Form not found.`, ['I9 Form not found.']);
            return next(customError);
        }
        const user = await userRepository.findOne({ where: { id: i9Form.owner } });
        await i9FormRepository.update({ id: form_id }, { status: genericEnums_1.Status.REVIEWED, review_notes });
        await (0, emailService_1.SendReviewEmail)(user.first_name, `I9 Form`, review_notes, String(user.email));
        return res.customSuccess(200, 'I9 Form successfully reviewed.', i9Form);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.ReviewI9Form = ReviewI9Form;
//# sourceMappingURL=reviewI9.js.map