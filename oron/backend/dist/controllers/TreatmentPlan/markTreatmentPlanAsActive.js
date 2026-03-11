"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markTreatmentPlanAsActive = void 0;
const typeorm_1 = require("typeorm");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const markTreatmentPlanAsActive = async (req, res, next) => {
    try {
        const fullPlanRepository = await (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const { treatment_plan_id, intake_full_id, treatment_plan_type } = req.body;
        if (!treatment_plan_id) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Treatment Plan ID is required', null, null);
            return next(customError);
        }
        const treatmentPlan = await fullPlanRepository.findOne({
            where: {
                id: treatment_plan_id,
                deleted_at: null,
            },
        });
        await fullPlanRepository.update({ intake_full_id, treatment_plan_type, deleted_at: null }, { active_treatment: false });
        if (!treatmentPlan) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Treatment Plan not found', null, null);
            return next(customError);
        }
        await fullPlanRepository.update(treatment_plan_id, {
            active_treatment: true,
        });
        return res.status(200).json({
            message: 'Treatment Plan marked as active successfully',
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Marking Treatment plan as active', null, err);
        return next(customError);
    }
};
exports.markTreatmentPlanAsActive = markTreatmentPlanAsActive;
//# sourceMappingURL=markTreatmentPlanAsActive.js.map