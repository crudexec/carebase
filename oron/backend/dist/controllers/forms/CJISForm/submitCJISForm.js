"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitCJISForm = void 0;
const typeorm_1 = require("typeorm");
const cjisFullForm_1 = require("orm/entities/CJISForm/cjisFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitCJISForm = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const cjisFullFormRepository = (0, typeorm_1.getRepository)(cjisFullForm_1.CJISFullForm);
        const cjisForm = await cjisFullFormRepository.findOne({ where: { user_id } });
        if (!cjisForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'CJIS Form does not exist', [`CJIS Form does not exist`]);
            return next(customError);
        }
        await cjisFullFormRepository.update(cjisForm.id, { status: genericEnums_1.Status.AWAITING_APPROVAL });
        return res.customSuccess(200, 'CJIS Form successfully submitted.', cjisForm);
    }
    catch (err) { }
};
exports.submitCJISForm = submitCJISForm;
//# sourceMappingURL=submitCJISForm.js.map