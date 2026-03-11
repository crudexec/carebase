"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTreatmentPlan = void 0;
const typeorm_1 = require("typeorm");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const treatmentGoalSignature_1 = require("orm/entities/TreatmentPlan/treatmentGoalSignature");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const signTreatmentPlan = async (req, res, next) => {
    try {
        const { full_name, treatment_full_id, intake_full_id, signature_url, treatment_plan_type } = req.body;
        const user_id = req.user.id;
        const treatmentPlanSignatureRepository = (0, typeorm_1.getRepository)(treatmentGoalSignature_1.TreatmentGoalSignature);
        const treatmentFullPlanRepository = (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const treatmentPlan = await treatmentFullPlanRepository.findOne({
            where: { id: treatment_full_id, deleted_at: null },
        });
        if (!treatmentPlan) {
            const customError = new CustomError_1.CustomError(404, 'General', `Treatment Plan not found`, ['Treatment Plan not found.']);
            return next(customError);
        }
        const newSignature = new treatmentGoalSignature_1.TreatmentGoalSignature();
        newSignature.full_name = full_name;
        newSignature.treatment_full_id = treatment_full_id;
        newSignature.intake_full_id = intake_full_id;
        newSignature.signature_url = signature_url;
        newSignature.signed_by = user_id;
        newSignature.treatment_plan_type = treatment_plan_type;
        await treatmentPlanSignatureRepository.save(newSignature);
        return res.customSuccess(200, 'Treatment Plan successfully signed.', newSignature);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error signing treatment plan', null, err);
        return next(customError);
    }
};
exports.signTreatmentPlan = signTreatmentPlan;
//# sourceMappingURL=signTreatmentPlan.js.map