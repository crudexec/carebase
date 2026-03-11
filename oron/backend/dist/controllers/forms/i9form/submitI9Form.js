"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitI9Form = void 0;
const typeorm_1 = require("typeorm");
const i9form_1 = require("orm/entities/i9Form/i9form");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitI9Form = async (req, res, next) => {
    try {
        const i9FormRepository = (0, typeorm_1.getRepository)(i9form_1.I9Form);
        const user_id = req.user.id;
        const i9Form = await i9FormRepository.findOne({ where: { owner: user_id } });
        if (!i9Form) {
            const customError = new CustomError_1.CustomError(400, 'General', 'I9 form does not exist', [`I9 form does not exist`]);
            return next(customError);
        }
        await i9FormRepository.update(i9Form.id, { status: genericEnums_1.Status.AWAITING_APPROVAL });
        return res.customSuccess(200, 'I9 form successfully submitted.', i9Form);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.submitI9Form = submitI9Form;
//# sourceMappingURL=submitI9Form.js.map