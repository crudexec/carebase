"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCurrentNeedsAndSupport = void 0;
const typeorm_1 = require("typeorm");
const CurrentNeedOrSupport_1 = require("orm/entities/SpecificNeedsForm/CurrentNeedOrSupport");
const SpecificNeedsFullForm_1 = require("orm/entities/SpecificNeedsForm/SpecificNeedsFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const genericEnums_1 = require("types/genericEnums");
const addCurrentNeedsAndSupport = async (req, res, next) => {
    try {
        const specificNeedsRepository = (0, typeorm_1.getRepository)(SpecificNeedsFullForm_1.SpecificNeedsFullForm);
        const currentNeedsRepository = (0, typeorm_1.getRepository)(CurrentNeedOrSupport_1.CurrentNeedOrSupport);
        const { current_needs, specific_needs_full_form_id, intake_full_id } = req.body;
        const specificNeedsFullForm = await specificNeedsRepository.findOne(specific_needs_full_form_id);
        if (!specificNeedsFullForm) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Specific needs full form not found', null);
            return next(customError);
        }
        const currentNeeds = new CurrentNeedOrSupport_1.CurrentNeedOrSupport();
        currentNeeds.current_needs = current_needs;
        currentNeeds.intake_full_id = intake_full_id;
        const newCurrentNeeds = await currentNeedsRepository.save(currentNeeds);
        if (!newCurrentNeeds) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Error adding current needs and support', null);
            return next(customError);
        }
        specificNeedsFullForm.current_need_or_support_id = newCurrentNeeds.id;
        specificNeedsFullForm.status = genericEnums_1.Status.IN_PROGRESS;
        await specificNeedsRepository.update(specificNeedsFullForm.id, specificNeedsFullForm);
        return res.customSuccess(200, 'Current needs and support added successfully.', newCurrentNeeds);
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error adding current needs and support', error);
        return next(customError);
    }
};
exports.addCurrentNeedsAndSupport = addCurrentNeedsAndSupport;
//# sourceMappingURL=addCurrentNeedsAndSupport.js.map