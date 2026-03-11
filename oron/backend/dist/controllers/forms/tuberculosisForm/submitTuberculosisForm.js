"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTuberculosisForm = void 0;
const typeorm_1 = require("typeorm");
const tuberculosisFullForm_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitTuberculosisForm = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const tuberculosisFormRepository = (0, typeorm_1.getRepository)(tuberculosisFullForm_1.TuberculosisFullForm);
        const tuberculosisForm = await tuberculosisFormRepository.findOne({ where: { owner: user_id } });
        if (!tuberculosisForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Tuberculosis form does not exist', [
                `Tuberculosis form does not exist`,
            ]);
            return next(customError);
        }
        await tuberculosisFormRepository.update(tuberculosisForm.id, { status: genericEnums_1.Status.AWAITING_APPROVAL });
        return res.customSuccess(200, 'Tuberculosis form successfully submitted.', tuberculosisForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.submitTuberculosisForm = submitTuberculosisForm;
//# sourceMappingURL=submitTuberculosisForm.js.map