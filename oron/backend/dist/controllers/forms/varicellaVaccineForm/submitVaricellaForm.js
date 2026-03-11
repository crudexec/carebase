"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitVaricellaForm = void 0;
const typeorm_1 = require("typeorm");
const varicellaFullForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitVaricellaForm = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const varicellaFormRepository = (0, typeorm_1.getRepository)(varicellaFullForm_1.VaricellaFullForm);
        const varicellaForm = await varicellaFormRepository.findOne({ where: { user_id } });
        if (!varicellaForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Varicella form does not exist', [
                `Varicella form does not exist`,
            ]);
            return next(customError);
        }
        await varicellaFormRepository.update(varicellaForm.id, { status: genericEnums_1.Status.AWAITING_APPROVAL });
        return res.customSuccess(200, 'Varicella form successfully submitted.', varicellaForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.submitVaricellaForm = submitVaricellaForm;
//# sourceMappingURL=submitVaricellaForm.js.map