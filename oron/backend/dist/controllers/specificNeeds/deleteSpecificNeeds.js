"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpecificNeeds = void 0;
const typeorm_1 = require("typeorm");
const SpecificNeedsFullForm_1 = require("../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const deleteSpecificNeeds = async (req, res, next) => {
    try {
        const specificNeedsRepository = (0, typeorm_1.getRepository)(SpecificNeedsFullForm_1.SpecificNeedsFullForm);
        const { specific_needs_full_form_id } = req.body;
        const specificNeedsForm = await specificNeedsRepository.findOne(specific_needs_full_form_id);
        if (!specificNeedsForm) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Specific needs form not found', null);
            return next(customError);
        }
        await specificNeedsRepository.softDelete(specific_needs_full_form_id);
        return res.customSuccess(200, 'Specific Needs Form successfully deleted.', null);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Creating Specific Needs Form', null, err);
        return next(customError);
    }
};
exports.deleteSpecificNeeds = deleteSpecificNeeds;
//# sourceMappingURL=deleteSpecificNeeds.js.map