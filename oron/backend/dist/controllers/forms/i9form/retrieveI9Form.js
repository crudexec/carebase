"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveFilledI9Document = void 0;
const typeorm_1 = require("typeorm");
const i9form_1 = require("orm/entities/i9Form/i9form");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveFilledI9Document = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const i9FormRepository = (0, typeorm_1.getRepository)(i9form_1.I9Form);
        const i9Form = await i9FormRepository.findOne({ where: { owner: user_id } });
        if (!i9Form) {
            const customError = new CustomError_1.CustomError(400, 'General', 'I9 form does not exist', [`I9 form does not exist`]);
            return next(customError);
        }
        return res.customSuccess(200, 'I9 form successfully retrieved.', i9Form);
    }
    catch (err) { }
};
exports.retrieveFilledI9Document = retrieveFilledI9Document;
//# sourceMappingURL=retrieveI9Form.js.map