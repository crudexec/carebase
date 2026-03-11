"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFilledI9Document = void 0;
const typeorm_1 = require("typeorm");
const i9form_1 = require("orm/entities/i9Form/i9form");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const uploadFilledI9Document = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { filled_pdf_json_data } = req.body;
        const i9FormRepository = (0, typeorm_1.getRepository)(i9form_1.I9Form);
        const i9Form = await i9FormRepository.findOne({ where: { owner: user_id } });
        if (i9Form) {
            const customError = new CustomError_1.CustomError(400, 'General', 'I9 Form already exists', [`I9 Form already exists`]);
            return next(customError);
        }
        const newI9Form = new i9form_1.I9Form();
        newI9Form.owner = user_id;
        newI9Form.filled_pdf_json_data = filled_pdf_json_data;
        newI9Form.status = genericEnums_1.Status.IN_PROGRESS;
        await i9FormRepository.save(newI9Form);
        return res.customSuccess(200, 'I9 form successfully uploaded.', newI9Form);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error uploading i9 pdf document', null, err);
        return next(customError);
    }
};
exports.uploadFilledI9Document = uploadFilledI9Document;
//# sourceMappingURL=i9FormUpload.js.map