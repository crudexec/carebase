"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitHepatitisForm = void 0;
const typeorm_1 = require("typeorm");
const HepatitisFullForm_1 = require("orm/entities/HepatitisBForm/HepatitisFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitHepatitisForm = async (req, res, next) => {
    try {
        const hepatitisFullFormRepository = (0, typeorm_1.getRepository)(HepatitisFullForm_1.HepatitisBFullForm);
        const user_id = req.user.id;
        const hepatitisForm = await hepatitisFullFormRepository.findOne({ where: { user_id } });
        if (!hepatitisForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Hepatitis form does not exist', [
                `Hepatitis form does not exist`,
            ]);
            return next(customError);
        }
        await hepatitisFullFormRepository.update(hepatitisForm.id, { status: genericEnums_1.Status.AWAITING_APPROVAL });
        return res.customSuccess(200, 'Hepatitis form successfully submitted.', hepatitisForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.submitHepatitisForm = submitHepatitisForm;
//# sourceMappingURL=submitHepatitisForm.js.map