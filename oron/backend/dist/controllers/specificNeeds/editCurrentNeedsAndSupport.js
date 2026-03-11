"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editCurrentNeedsAndSupport = void 0;
const typeorm_1 = require("typeorm");
const CurrentNeedOrSupport_1 = require("../../orm/entities/SpecificNeedsForm/CurrentNeedOrSupport");
const SpecificNeedsFullForm_1 = require("../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editCurrentNeedsAndSupport = async (req, res, next) => {
    try {
        const specificNeedsRepository = (0, typeorm_1.getRepository)(SpecificNeedsFullForm_1.SpecificNeedsFullForm);
        const currentNeedsRepository = (0, typeorm_1.getRepository)(CurrentNeedOrSupport_1.CurrentNeedOrSupport);
        let { current_needs, specific_needs_full_form_id, current_need_or_support_id } = req.body;
        const specificNeedsFullForm = await specificNeedsRepository.findOne(specific_needs_full_form_id);
        if (!specificNeedsFullForm) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Specific needs full form not found', null);
            return next(customError);
        }
        const existingCurrentNeeds = await currentNeedsRepository.findOne(current_need_or_support_id);
        if (!existingCurrentNeeds) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Current needs and support not found', null);
            return next(customError);
        }
        existingCurrentNeeds.current_needs = current_needs;
        const updatedCurrentNeeds = await currentNeedsRepository.update(existingCurrentNeeds.id, existingCurrentNeeds);
        if (!updatedCurrentNeeds) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Error updating current needs and support', null);
            return next(customError);
        }
        return res.customSuccess(200, 'Current needs and support updated successfully.', updatedCurrentNeeds);
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error updating current needs and support', error);
        return next(customError);
    }
};
exports.editCurrentNeedsAndSupport = editCurrentNeedsAndSupport;
//# sourceMappingURL=editCurrentNeedsAndSupport.js.map