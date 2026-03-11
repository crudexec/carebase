"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFilledI9Document = void 0;
const typeorm_1 = require("typeorm");
const i9form_1 = require("orm/entities/i9Form/i9form");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editFilledI9Document = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        let { filled_pdf_json_data } = req.body;
        const i9FormRepository = (0, typeorm_1.getRepository)(i9form_1.I9Form);
        const i9Form = await i9FormRepository.findOne({ where: { owner: user_id } });
        if (!i9Form) {
            const customError = new CustomError_1.CustomError(400, 'General', 'I9 form does not exist', [`I9 form does not exist`]);
            return next(customError);
        }
        filled_pdf_json_data = filled_pdf_json_data ?? i9Form.filled_pdf_json_data;
        const updatedI9Form = new i9form_1.I9Form();
        updatedI9Form.filled_pdf_json_data = filled_pdf_json_data;
        updatedI9Form.status = genericEnums_1.Status.AWAITING_APPROVAL;
        await i9FormRepository.update(i9Form.id, updatedI9Form);
        return res.customSuccess(200, 'I9 form successfully updated.', updatedI9Form);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error editing uploaded i9 pdf document', null, err);
        return next(customError);
    }
};
exports.editFilledI9Document = editFilledI9Document;
//# sourceMappingURL=editi9FormUpload.js.map