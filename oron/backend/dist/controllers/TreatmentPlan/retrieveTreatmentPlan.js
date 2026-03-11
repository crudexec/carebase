"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveTreatmentPlan = void 0;
const typeorm_1 = require("typeorm");
const basicInformation_1 = require("orm/entities/TreatmentPlan/basicInformation");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const treatmentGoal_1 = require("orm/entities/TreatmentPlan/treatmentGoal");
const treatmentGoalSignature_1 = require("orm/entities/TreatmentPlan/treatmentGoalSignature");
const treatmentSchedule_1 = require("orm/entities/TreatmentPlan/treatmentSchedule");
const documentPlan_1 = require("orm/entities/TreatmentPlan/documentPlan");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveTreatmentPlan = async (req, res, next) => {
    try {
        const fullPlanRepository = await (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const treatmentGoalRepository = await (0, typeorm_1.getRepository)(treatmentGoal_1.TreatmentGoal);
        const basicInformationRepository = await (0, typeorm_1.getRepository)(basicInformation_1.TreatmentBasicInformation);
        const treatmentScheduleRepository = await (0, typeorm_1.getRepository)(treatmentSchedule_1.TreatmentSchedule);
        const treatmentGoalSignatureRepository = await (0, typeorm_1.getRepository)(treatmentGoalSignature_1.TreatmentGoalSignature);
        const treatmentPlanDocumentRepository = await (0, typeorm_1.getRepository)(documentPlan_1.TreatmentPlanDocuments);
        const intake_full_id = req.params.intake_full_id;
        let treatmentPlans = [];
        let treatmentData = {};
        if (!intake_full_id) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Intake Full ID is required', null, null);
            return next(customError);
        }
        let treatment_type = req.query.treatment_type;
        treatment_type = treatment_type ?? 'IISS_Assessment';
        const fullPlans = await fullPlanRepository.find({
            where: {
                intake_full_id,
                treatment_plan_type: treatment_type,
                deleted_at: null,
            },
            order: { created_at: 'DESC' },
        });
        for (const fullPlan of fullPlans) {
            const basicInformation = await basicInformationRepository.findOne({
                where: {
                    id: fullPlan.basic_information_id,
                    intake_full_id,
                    treatment_plan_type: treatment_type,
                    deleted_at: null,
                },
                order: { created_at: 'DESC' },
            });
            const treatmentGoalIds = fullPlan.treatment_goal_ids || [];
            const treatmentGoals = await treatmentGoalRepository.find({
                where: {
                    intake_full_id,
                    deleted_at: null,
                    id: (0, typeorm_1.In)(treatmentGoalIds),
                },
                order: { created_at: 'DESC' },
            });
            const treatmentSchedule = await treatmentScheduleRepository.find({
                where: { intake_full_id, treatment_plan_type: treatment_type, deleted_at: null },
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
            const treatmentDocuments = await treatmentPlanDocumentRepository.find({
                where: { intake_full_id, treatment_plan_type: treatment_type, deleted_at: null },
                order: { created_at: 'DESC' },
            });
            treatmentData = {
                ...fullPlan,
                treatmentGoal: treatmentGoals,
                basicInformation,
                treatmentSchedule,
                treatmentGoalSignature,
                treatmentDocuments,
            };
            treatmentPlans.push(treatmentData);
        }
        return res.customSuccess(200, 'Treatment plans successfully retrieved.', { treatmentPlans });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Retrieving Treatment plan Information', null, err);
        return next(customError);
    }
};
exports.retrieveTreatmentPlan = retrieveTreatmentPlan;
//# sourceMappingURL=retrieveTreatmentPlan.js.map