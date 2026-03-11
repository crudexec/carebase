"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTreatmentPlan = void 0;
const typeorm_1 = require("typeorm");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const completeTreatmentPlan = async (req, res, next) => {
    try {
        const { treatment_full_id } = req.body;
        const fullPlanRepository = await (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const fullPlan = await fullPlanRepository.findOne({
            where: { id: treatment_full_id, deleted_at: null },
        });
        if (!fullPlan) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Treatment Plan Not Found', ['Treatment Plan not found']);
            return next(customError);
        }
        await fullPlanRepository.update({ id: treatment_full_id }, { status: genericEnums_1.Status.NOT_SENT });
        return res.customSuccess(200, 'Treatment plan successfully completed', null);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Completing Treatment Plan', null, err);
        return next(customError);
    }
};
exports.completeTreatmentPlan = completeTreatmentPlan;
//# sourceMappingURL=completeTreatmentPlan.js.map