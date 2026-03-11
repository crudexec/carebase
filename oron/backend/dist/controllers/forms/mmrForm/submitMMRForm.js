"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitMMRForm = void 0;
const typeorm_1 = require("typeorm");
const mmrFullForm_1 = require("orm/entities/MMRVaccineForm/mmrFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitMMRForm = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const mmrFormRepository = (0, typeorm_1.getRepository)(mmrFullForm_1.MMRFullForm);
        const mmrForm = await mmrFormRepository.findOne({ where: { user_id } });
        if (!mmrForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'MMR form does not exist', [`MMR form does not exist`]);
            return next(customError);
        }
        await mmrFormRepository.update(mmrForm.id, { status: genericEnums_1.Status.AWAITING_APPROVAL });
        return res.customSuccess(200, 'MMR form successfully submitted.', mmrForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.submitMMRForm = submitMMRForm;
//# sourceMappingURL=submitMMRForm.js.map