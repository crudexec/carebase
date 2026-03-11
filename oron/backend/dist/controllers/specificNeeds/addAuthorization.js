"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAuthorization = void 0;
const typeorm_1 = require("typeorm");
const Authorization_1 = require("../../orm/entities/SpecificNeedsForm/Authorization");
const SpecificNeedsFullForm_1 = require("../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm");
const intakeFullForm_1 = require("../../orm/entities/IntakeForm/intakeFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addAuthorization = async (req, res, next) => {
    try {
        const authorizationRepository = (0, typeorm_1.getRepository)(Authorization_1.Authorization);
        const intakeRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const specificNeedsRepository = (0, typeorm_1.getRepository)(SpecificNeedsFullForm_1.SpecificNeedsFullForm);
        const { creator_name, signature_confirmation, intake_full_id, specific_needs_full_form_id, signature_url } = req.body;
        const intakeForm = await intakeRepository.findOne({ where: { id: intake_full_id, deleted_at: null } });
        if (!intakeForm) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Intake form not found', null);
            return next(customError);
        }
        const authorization = new Authorization_1.Authorization();
        authorization.creator_name = creator_name;
        authorization.signature_confirmation = signature_confirmation;
        authorization.intake_full_id = intake_full_id;
        authorization.signature_url = signature_url;
        const newAuthorization = await authorizationRepository.save(authorization);
        if (!newAuthorization) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Error adding authorization', null);
            return next(customError);
        }
        const specificNeedsForm = await specificNeedsRepository.findOne({
            where: {
                id: specific_needs_full_form_id,
                deleted_at: null,
            },
        });
        if (!specificNeedsForm) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Specific needs form not found', null);
            return next(customError);
        }
        specificNeedsForm.authorization_id = newAuthorization.id;
        await specificNeedsRepository.update(specificNeedsForm.id, specificNeedsForm);
        return res.customSuccess(200, 'Authorization added successfully.', newAuthorization);
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error adding authorization', error);
        return next(customError);
    }
};
exports.addAuthorization = addAuthorization;
//# sourceMappingURL=addAuthorization.js.map