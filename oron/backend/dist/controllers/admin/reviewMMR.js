"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewMMRForm = void 0;
const typeorm_1 = require("typeorm");
const mmrFullForm_1 = require("orm/entities/MMRVaccineForm/mmrFullForm");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ReviewMMRForm = async (req, res, next) => {
    const mmrFullForm = (0, typeorm_1.getRepository)(mmrFullForm_1.MMRFullForm);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    const { review_notes } = req.body;
    try {
        const mmrForm = await mmrFullForm.findOne({ where: { id: form_id } });
        if (!mmrForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `MMR Form not found.`, ['MMR Form not found.']);
            return next(customError);
        }
        const user = await userRepository.findOne({ where: { id: mmrForm.user_id } });
        await mmrFullForm.update({ id: form_id }, { status: genericEnums_1.Status.REVIEWED, review_notes });
        await (0, emailService_1.SendReviewEmail)(user.first_name, `MMR Form`, review_notes, String(user.email));
        return res.customSuccess(200, 'MMR Form successfully reviewed.', mmrForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.ReviewMMRForm = ReviewMMRForm;
//# sourceMappingURL=reviewMMR.js.map