"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPneumococcalForm = void 0;
const typeorm_1 = require("typeorm");
const pneumococcalFullForm_1 = require("orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitPneumococcalForm = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const pneumococcalFormRepository = (0, typeorm_1.getRepository)(pneumococcalFullForm_1.PneumococcalVaccinationFullForm);
        const pneumococcalForm = await pneumococcalFormRepository.findOne({ where: { user_id } });
        if (!pneumococcalForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Pneumococcal form does not exist', [
                `Pneumococcal form does not exist`,
            ]);
            return next(customError);
        }
        await pneumococcalFormRepository.update(pneumococcalForm.id, { status: genericEnums_1.Status.AWAITING_APPROVAL });
        return res.customSuccess(200, 'Pneumococcal form successfully submitted.', pneumococcalForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.submitPneumococcalForm = submitPneumococcalForm;
//# sourceMappingURL=submitPneumococcalForm.js.map