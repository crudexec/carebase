"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitInfluenzaForm = void 0;
const typeorm_1 = require("typeorm");
const influenzaDeclinationFullForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitInfluenzaForm = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const influenzaFormRepository = (0, typeorm_1.getRepository)(influenzaDeclinationFullForm_1.InfluenzaVaccinationDeclinationFullForm);
        const influenzaForm = await influenzaFormRepository.findOne({ where: { user_id } });
        if (!influenzaForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Influenza form does not exist', [
                `Influenza form does not exist`,
            ]);
            return next(customError);
        }
        await influenzaFormRepository.update(influenzaForm.id, { status: genericEnums_1.Status.AWAITING_APPROVAL });
        return res.customSuccess(200, 'Influenza form successfully submitted.', influenzaForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.submitInfluenzaForm = submitInfluenzaForm;
//# sourceMappingURL=submitInfluenzaForm.js.map