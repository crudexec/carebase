"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGenericSpecificNeeds = void 0;
const typeorm_1 = require("typeorm");
const SpecificNeedsFullForm_1 = require("../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const genericEnums_1 = require("types/genericEnums");
const createGenericSpecificNeeds = async (req, res, next) => {
    try {
        const specificNeedsRepository = (0, typeorm_1.getRepository)(SpecificNeedsFullForm_1.SpecificNeedsFullForm);
        const registered_by = req.user.id;
        const intake_full_id = req.body.intake_full_id;
        const specificNeeds = new SpecificNeedsFullForm_1.SpecificNeedsFullForm();
        specificNeeds.intake_full_id = intake_full_id;
        specificNeeds.status = genericEnums_1.Status.DRAFT;
        specificNeeds.registered_by = registered_by;
        const savedSpecificNeeds = await specificNeedsRepository.save(specificNeeds);
        return res.customSuccess(200, 'Specific Needs Form successfully created.', savedSpecificNeeds);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Creating Specific Needs Form', null, err);
        return next(customError);
    }
};
exports.createGenericSpecificNeeds = createGenericSpecificNeeds;
//# sourceMappingURL=createGenericSpecificNeeds.js.map