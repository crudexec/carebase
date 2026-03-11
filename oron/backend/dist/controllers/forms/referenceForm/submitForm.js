"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitReferenceForm = void 0;
const typeorm_1 = require("typeorm");
const reference_1 = require("orm/entities/ReferenceForm/reference");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitReferenceForm = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const referenceFormRepository = (0, typeorm_1.getRepository)(reference_1.ReferenceForm);
        const referenceForm = await referenceFormRepository.findOne({ where: { user_id } });
        if (!referenceForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Reference form does not exist', [
                `Reference form does not exist`,
            ]);
            return next(customError);
        }
        await referenceFormRepository.update(referenceForm.id, { status: genericEnums_1.Status.AWAITING_APPROVAL });
        return res.customSuccess(200, 'Reference form successfully submitted.', referenceForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error while submitting reference form', null, err);
        return next(customError);
    }
};
exports.submitReferenceForm = submitReferenceForm;
//# sourceMappingURL=submitForm.js.map