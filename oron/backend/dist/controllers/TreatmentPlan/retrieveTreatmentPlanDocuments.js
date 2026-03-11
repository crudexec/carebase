"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveTreatmentPlanDocuments = void 0;
const typeorm_1 = require("typeorm");
const documentPlan_1 = require("orm/entities/TreatmentPlan/documentPlan");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveTreatmentPlanDocuments = async (req, res, next) => {
    try {
        const intake_full_id = req.params.intake_full_id;
        if (!intake_full_id) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Intake Full ID is required', null, null);
            return next(customError);
        }
        const documentRepository = await (0, typeorm_1.getRepository)(documentPlan_1.TreatmentPlanDocuments);
        const documents = await documentRepository.find({ intake_full_id, deleted_at: null });
        return res.customSuccess(200, 'Documents retrieved.', { documents });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Retrieving Treatment plan Information', null, err);
        return next(customError);
    }
};
exports.retrieveTreatmentPlanDocuments = retrieveTreatmentPlanDocuments;
//# sourceMappingURL=retrieveTreatmentPlanDocuments.js.map