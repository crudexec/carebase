"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveTreatmentGoalsForVisitLog = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const treatmentGoal_1 = require("orm/entities/TreatmentPlan/treatmentGoal");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveTreatmentGoalsForVisitLog = async (req, res, next) => {
    try {
        const treatmentGoalRepository = await (0, typeorm_1.getRepository)(treatmentGoal_1.TreatmentGoal);
        const treatmentPlanRepository = await (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const intakeRepository = await (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const intake_full_id = req.params.intake_full_id;
        const treatment_plan_type = req.query.treatment_plan_type;
        const activeTreatmentPlan = await treatmentPlanRepository.findOne({
            where: {
                intake_full_id,
                treatment_plan_type,
                active_treatment: true,
                deleted_at: null,
            },
        });
        const intakeExists = await intakeRepository.findOne({
            where: { id: intake_full_id, deleted_at: null },
        });
        if (!intakeExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Intake Form not found`, ['Intake Form not found.']);
            return next(customError);
        }
        if (!activeTreatmentPlan) {
            return res.customSuccess(200, 'No active treatment plan found.', []);
        }
        const treatmentGoals = await treatmentGoalRepository.find({
            where: {
                intake_full_id,
                treatment_plan_type,
                id: (0, typeorm_1.In)(activeTreatmentPlan.treatment_goal_ids),
                deleted_at: null,
            },
            order: { created_at: 'DESC' },
        });
        return res.customSuccess(200, 'Treatment Goal Information successfully retrieved.', treatmentGoals);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Retrieving Treatment Goal Information', null, err);
        return next(customError);
    }
};
exports.retrieveTreatmentGoalsForVisitLog = retrieveTreatmentGoalsForVisitLog;
//# sourceMappingURL=retrieveTreatmentGoals.js.map