"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitFluForm = void 0;
const typeorm_1 = require("typeorm");
const fluFullForm_1 = require("orm/entities/FluForm/fluFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitFluForm = async (req, res, next) => {
    try {
        const fluFormRepository = (0, typeorm_1.getRepository)(fluFullForm_1.FluFullForm);
        const user_id = req.user.id;
        const fluForm = await fluFormRepository.findOne({ where: { user_id } });
        if (!fluForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Flu form does not exist', [`Flu form does not exist`]);
            return next(customError);
        }
        await fluFormRepository.update(fluForm.id, { status: genericEnums_1.Status.AWAITING_APPROVAL });
        return res.customSuccess(200, 'Flu form successfully submitted.', fluForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.submitFluForm = submitFluForm;
//# sourceMappingURL=submitFluForm.js.map