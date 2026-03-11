"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendParentTreatmentPlan = void 0;
const typeorm_1 = require("typeorm");
const basicInformation_1 = require("orm/entities/TreatmentPlan/basicInformation");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const sendParentTreatmentPlan = async (req, res, next) => {
    try {
        const { parent_name, parent_email, relation_to_participant, treatment_full_id, intake_full_id, treatment_plan_type, } = req.body;
        const treatmentFullPlanRepository = (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const treatmentBasicInformationRepository = (0, typeorm_1.getRepository)(basicInformation_1.TreatmentBasicInformation);
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
        treatmentPlan.parent_email = parent_email;
        treatmentPlan.relation_to_participant = relation_to_participant;
        treatmentPlan.parent_name = parent_name;
        treatmentPlan.parent_email_sent = true;
        treatmentPlan.status = genericEnums_1.Status.AWAITING_SIGNATURE;
        const invitationLink = `${process.env.FRONTEND_URL}/sign-treatment-plan/${treatmentPlan.id}/?treatment_plan_type=${treatment_plan_type}`;
        await treatmentFullPlanRepository.update(treatmentPlan.id, treatmentPlan);
        await (0, emailService_1.sendRequestParentSignature)(parent_name, basicInformation.participant_first_name, invitationLink, parent_email);
        treatmentPlan.parent_email_sent = true;
        await treatmentFullPlanRepository.update(treatmentPlan.id, treatmentPlan);
        return res.customSuccess(200, 'Treatment Plan successfully requested from parent.', treatmentPlan);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error requesting for parent signature', null, err);
        return next(customError);
    }
};
exports.sendParentTreatmentPlan = sendParentTreatmentPlan;
//# sourceMappingURL=sendTreatmentToParent.js.map