"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveTreatmentPlanForParent = void 0;
const typeorm_1 = require("typeorm");
const basicInformation_1 = require("orm/entities/TreatmentPlan/basicInformation");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const treatmentGoal_1 = require("orm/entities/TreatmentPlan/treatmentGoal");
const treatmentGoalSignature_1 = require("orm/entities/TreatmentPlan/treatmentGoalSignature");
const treatmentSchedule_1 = require("orm/entities/TreatmentPlan/treatmentSchedule");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveTreatmentPlanForParent = async (req, res, next) => {
    try {
        const fullPlanRepository = await (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const treatmentGoalRepository = await (0, typeorm_1.getRepository)(treatmentGoal_1.TreatmentGoal);
        const basicInformationRepository = await (0, typeorm_1.getRepository)(basicInformation_1.TreatmentBasicInformation);
        const treatmentScheduleRepository = await (0, typeorm_1.getRepository)(treatmentSchedule_1.TreatmentSchedule);
        const treatmentGoalSignatureRepository = await (0, typeorm_1.getRepository)(treatmentGoalSignature_1.TreatmentGoalSignature);
        const treatment_plan_type = req.query.treatment_type;
        const treatment_full_id = req.params.treatment_full_id;
        let treatmentData = {};
        let treatment_type = req.query.treatment_type;
        treatment_type = treatment_type ?? 'IISS_Assessment';
        const fullPlan = await fullPlanRepository.findOne({
            where: { id: treatment_full_id, treatment_plan_type, deleted_at: null },
            order: { created_at: 'DESC' },
        });
        const basicInformation = await basicInformationRepository.findOne({
            where: { intake_full_id: fullPlan.intake_full_id, treatment_plan_type, deleted_at: null },
            order: { created_at: 'DESC' },
        });
        const treatmentGoals = await treatmentGoalRepository.find({
            where: { intake_full_id: fullPlan.intake_full_id, treatment_plan_type, deleted_at: null },
            order: { created_at: 'DESC' },
        });
        const treatmentSchedule = await treatmentScheduleRepository.find({
            where: { intake_full_id: fullPlan.intake_full_id, treatment_plan_type, deleted_at: null },
            order: { created_at: 'DESC' },
        });
        const treatmentGoalSignature = (await treatmentGoalSignatureRepository.findOne({
            where: {
                intake_full_id: fullPlan.intake_full_id,
                treatment_plan_type: treatment_type,
                parent_signed: true,
                deleted_at: null,
            },
            order: { created_at: 'DESC' },
        })) ??
            (await treatmentGoalSignatureRepository.findOne({
                where: {
                    intake_full_id: fullPlan.intake_full_id,
                    treatment_plan_type: treatment_type,
                    deleted_at: null,
                },
                order: { created_at: 'DESC' },
            }));
        treatmentData = {
            ...fullPlan,
            treatmentGoal: treatmentGoals,
            basicInformation,
            treatmentSchedule,
            treatmentGoalSignature,
        };
        return res.customSuccess(200, 'Treatment Schedule Information successfully retrieved.', treatmentData);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Retrieving Treatment Schedule Information', null, err);
        return next(customError);
    }
};
exports.retrieveTreatmentPlanForParent = retrieveTreatmentPlanForParent;
//# sourceMappingURL=retrieveTreatmentForParent.js.map