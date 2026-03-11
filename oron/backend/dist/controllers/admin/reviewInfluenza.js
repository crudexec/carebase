"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewInfluenzaForm = void 0;
const typeorm_1 = require("typeorm");
const influenzaDeclinationFullForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ReviewInfluenzaForm = async (req, res, next) => {
    const influenzaVaccinationDeclinationFullFormRepository = (0, typeorm_1.getRepository)(influenzaDeclinationFullForm_1.InfluenzaVaccinationDeclinationFullForm);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    const { review_notes } = req.body;
    try {
        const influenzaForm = await influenzaVaccinationDeclinationFullFormRepository.findOne({ where: { id: form_id } });
        if (!influenzaForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Influenza Form not found.`, ['Influenza Form not found.']);
            return next(customError);
        }
        const user = await userRepository.findOne({ where: { id: influenzaForm.user_id } });
        await influenzaVaccinationDeclinationFullFormRepository.update({ id: form_id }, { status: genericEnums_1.Status.REVIEWED, review_notes });
        await (0, emailService_1.SendReviewEmail)(user.first_name, `Influenza Form`, review_notes, String(user.email));
        return res.customSuccess(200, 'Influenza Form successfully reviewed.', influenzaForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.ReviewInfluenzaForm = ReviewInfluenzaForm;
//# sourceMappingURL=reviewInfluenza.js.map