"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveGenericSpecificNeeds = void 0;
const typeorm_1 = require("typeorm");
const SpecificNeedsFullForm_1 = require("../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveGenericSpecificNeeds = async (req, res, next) => {
    try {
        const specificNeedsRepository = (0, typeorm_1.getRepository)(SpecificNeedsFullForm_1.SpecificNeedsFullForm);
        const intake_full_id = req.query.intake_full_id;
        const specificNeedsForm = await specificNeedsRepository.findOne({
            where: { intake_full_id, deleted_at: null },
            relations: ['basicInformation', 'serviceNeeds', 'currentNeedOrSupport', 'authorization', 'intakeFullForm'],
        });
        if (!specificNeedsForm) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Specific needs form not found', null);
            return next(customError);
        }
        return res.customSuccess(200, 'Specific Needs Form successfully retrieved.', specificNeedsForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Creating Specific Needs Form', null, err);
        return next(customError);
    }
};
exports.retrieveGenericSpecificNeeds = retrieveGenericSpecificNeeds;
//# sourceMappingURL=retrieveSpecificNeeds.js.map