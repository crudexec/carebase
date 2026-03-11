"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareTreatmentPlan = void 0;
const typeorm_1 = require("typeorm");
const basicInformation_1 = require("orm/entities/TreatmentPlan/basicInformation");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const sharedTreatmentPlan_1 = require("orm/entities/TreatmentPlan/sharedTreatmentPlan");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const shareTreatmentPlan = async (req, res, next) => {
    try {
        const { recipient_name, recipient_email, recipient_role, treatment_full_id, intake_full_id, treatment_plan_type } = req.body;
        const treatmentFullPlanRepository = (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const treatmentBasicInformationRepository = (0, typeorm_1.getRepository)(basicInformation_1.TreatmentBasicInformation);
        const sharedTreatmentPlanRepository = (0, typeorm_1.getRepository)(sharedTreatmentPlan_1.SharedTreatmentPlan);
        const treatmentPlan = await treatmentFullPlanRepository.findOne({
            where: { id: treatment_full_id, deleted_at: null },
            order: { created_at: 'DESC' },
        });
        const basicInformation = await treatmentBasicInformationRepository.findOne({
            where: { intake_full_id, deleted_at: null },
        });
        if (!treatmentPlan) {
            const customError = new CustomError_1.CustomError(404, 'General', `Treatment Plan not found`, ['Treatment Plan not found.']);
            return next(customError);
        }
        if (!basicInformation) {
            const customError = new CustomError_1.CustomError(404, 'General', `Basic Information not found`, [
                'Basic Information not found.',
            ]);
            return next(customError);
        }
        const invitationLink = `${process.env.FRONTEND_URL}/preview-treatment-plan/${treatmentPlan.id}?treatment_plan_type=${treatment_plan_type}`;
        await (0, emailService_1.sendSharedTreatmentPlan)(recipient_name, basicInformation.participant_first_name, invitationLink, recipient_email);
        const sharedTreatmentPlan = new sharedTreatmentPlan_1.SharedTreatmentPlan();
        sharedTreatmentPlan.recipient_name = recipient_name;
        sharedTreatmentPlan.recipient_email = recipient_email;
        sharedTreatmentPlan.recipient_role_or_position = recipient_role;
        sharedTreatmentPlan.intake_full_id = intake_full_id;
        sharedTreatmentPlan.treatment_full_id = treatment_full_id;
        await sharedTreatmentPlanRepository.save(sharedTreatmentPlan);
        return res.customSuccess(200, 'Treatment Plan successfully shared', treatmentPlan);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error sharing treatment plan', null, err);
        return next(customError);
    }
};
exports.shareTreatmentPlan = shareTreatmentPlan;
//# sourceMappingURL=shareTreatmentPlan.js.map