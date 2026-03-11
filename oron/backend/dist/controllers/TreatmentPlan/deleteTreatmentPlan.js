"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTreatmentPlan = void 0;
const typeorm_1 = require("typeorm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const deleteTreatmentPlan = async (req, res, next) => {
    try {
        const { treatment_plan_id } = req.body;
        const treatmentFullPlanRepository = (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        if (!treatment_plan_id) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Treatment Plan ID is required', null, null);
            return next(customError);
        }
        const treatmentPlan = await treatmentFullPlanRepository.findOne({
            where: {
                id: treatment_plan_id,
                deleted_at: null,
            },
        });
        if (!treatmentPlan) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Treatment Plan not found', null, null);
            return next(customError);
        }
        await treatmentFullPlanRepository.softDelete(treatment_plan_id);
        return res.status(200).json({
            message: 'Treatment Plan deleted successfully',
        });
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(500, 'Raw', 'Error deleting treatment plan', null, null);
        return next(customError);
    }
};
exports.deleteTreatmentPlan = deleteTreatmentPlan;
//# sourceMappingURL=deleteTreatmentPlan.js.map