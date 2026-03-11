"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signParentTreatmentPlan = void 0;
const typeorm_1 = require("typeorm");
const basicInformation_1 = require("orm/entities/TreatmentPlan/basicInformation");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const treatmentGoalSignature_1 = require("orm/entities/TreatmentPlan/treatmentGoalSignature");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const signParentTreatmentPlan = async (req, res, next) => {
    try {
        let { treatment_full_id, parent_signature_url, treatment_plan_type } = req.body;
        const treatmentPlanSignatureRepository = (0, typeorm_1.getRepository)(treatmentGoalSignature_1.TreatmentGoalSignature);
        const treatmentFullPlanRepository = (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const treatmentBasicInformationRepository = (0, typeorm_1.getRepository)(basicInformation_1.TreatmentBasicInformation);
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        treatment_plan_type = treatment_plan_type ?? 'IISS_Assessment';
        const treatmentPlan = await treatmentFullPlanRepository.findOne({
            where: { id: treatment_full_id, deleted_at: null },
        });
        if (!treatmentPlan) {
            const customError = new CustomError_1.CustomError(404, 'General', `Treatment Plan not found`, ['Treatment Plan not found.']);
            return next(customError);
        }
        const signedTreatmentPlan = await treatmentPlanSignatureRepository.findOne({
            where: { treatment_full_id, deleted_at: null },
        });
        if (!signedTreatmentPlan) {
            const customError = new CustomError_1.CustomError(404, 'General', `Treatment Plan not signed by admin`, [
                'Treatment Plan not signed by admin.',
            ]);
            return next(customError);
        }
        const basicInformation = await treatmentBasicInformationRepository.findOne({
            where: { intake_full_id: treatmentPlan.intake_full_id, deleted_at: null },
        });
        parent_signature_url = parent_signature_url ?? signedTreatmentPlan.parent_signature_url;
        signedTreatmentPlan.parent_signature_url = parent_signature_url;
        signedTreatmentPlan.parent_signed = true;
        signedTreatmentPlan.date_parent_signed = new Date();
        treatmentPlan.status = genericEnums_1.Status.SIGNED;
        await treatmentFullPlanRepository.update({ id: treatmentPlan.id }, treatmentPlan);
        await treatmentPlanSignatureRepository.update({ id: signedTreatmentPlan.id }, signedTreatmentPlan);
        const treatmentSignature = await treatmentPlanSignatureRepository.findOne({
            where: { treatment_full_id, parent_signed: true, deleted_at: null },
        });
        const invitationLink = `${process.env.FRONTEND_URL}/admin/clients/${treatmentPlan.intake_full_id}`;
        const parentInvitationLink = `${process.env.FRONTEND_URL}/sign-treatment-plan/${treatmentPlan.id}/?treatment_plan_type=${treatment_plan_type}`;
        const user = await userRepository.findOne({
            where: { id: treatmentPlan.registered_by, deleted_at: null },
        });
        await (0, emailService_1.sendParentSignatureConfirmation)(treatmentPlan.parent_name, basicInformation.participant_first_name, parentInvitationLink, treatmentPlan.parent_email);
        await (0, emailService_1.sendAdminParentSignatureConfirmation)(treatmentPlan.parent_name, basicInformation.participant_first_name, invitationLink, new Date(signedTreatmentPlan.date_parent_signed).toDateString(), user.email);
        return res.customSuccess(200, 'Treatment Plan successfully signed by admin', treatmentSignature);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error signing treatment plan', null, err);
        return next(customError);
    }
};
exports.signParentTreatmentPlan = signParentTreatmentPlan;
//# sourceMappingURL=signParentSignature.js.map