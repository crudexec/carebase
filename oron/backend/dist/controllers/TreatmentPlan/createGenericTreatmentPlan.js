"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGenericTreatmentFullPlan = void 0;
const typeorm_1 = require("typeorm");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const createGenericTreatmentFullPlan = async (req, res, next) => {
    try {
        const { intake_full_id, treatment_plan_type, tp_implemented_by, tp_type } = req.body;
        const registered_by = req.user.id;
        const treatmentFullPlanRepository = (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const treatmentFullPlan = new treatmentFullPlan_1.TreatmentFullPlan();
        treatmentFullPlan.intake_full_id = intake_full_id;
        treatmentFullPlan.treatment_plan_type = treatment_plan_type;
        treatmentFullPlan.tp_implemented_by = tp_implemented_by;
        treatmentFullPlan.tp_type = tp_type;
        treatmentFullPlan.registered_by = registered_by;
        treatmentFullPlan.active_treatment = true;
        const savedTreatmentFullPlan = await treatmentFullPlanRepository.save(treatmentFullPlan);
        return res.customSuccess(200, 'Treatment Plan successfully created.', savedTreatmentFullPlan);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Creating Generic Treatment Plan', null, err);
        return next(customError);
    }
};
exports.createGenericTreatmentFullPlan = createGenericTreatmentFullPlan;
//# sourceMappingURL=createGenericTreatmentPlan.js.map