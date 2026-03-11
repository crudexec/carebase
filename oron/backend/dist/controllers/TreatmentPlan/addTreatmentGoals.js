"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTreatmentGoal = void 0;
const typeorm_1 = require("typeorm");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const treatmentGoal_1 = require("orm/entities/TreatmentPlan/treatmentGoal");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addTreatmentGoal = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const intake_full_id = req.params.intake_full_id;
        const goalRepository = (0, typeorm_1.getRepository)(treatmentGoal_1.TreatmentGoal);
        const fullPlanRepository = (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const { goalArray, treatment_plan_type, treatment_full_id } = req.body;
        if (goalArray.length === 0) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Error saving basic goal information, it must be an array', null, null);
            return next(customError);
        }
        for (const goal of goalArray) {
            const { goal_area, target_skill, short_term_objective, goal_status, goal_setting, number_of_trials, goal_frequency, current_skill_level, target_performance_level, goal_background, goal_statement, implementation_procedure, objective_term_steps, evaluating_progress, reinforcers, materials, progress_monitoring, mastery_towards_goal_achievement, expected_outcome, goal_comment, present_level, target_level, consequences, } = goal;
            let savedGoal;
            const newGoal = new treatmentGoal_1.TreatmentGoal();
            newGoal.registered_by = user_id;
            newGoal.goal_area = goal_area;
            newGoal.target_skill = target_skill;
            newGoal.short_term_objective = short_term_objective;
            newGoal.goal_status = goal_status;
            newGoal.goal_setting = goal_setting;
            newGoal.number_of_trials = number_of_trials;
            newGoal.goal_frequency = goal_frequency;
            newGoal.current_skill_level = current_skill_level;
            newGoal.target_performance_level = target_performance_level;
            newGoal.goal_background = goal_background;
            newGoal.goal_statement = goal_statement;
            newGoal.implementation_procedure = implementation_procedure;
            newGoal.objective_term_steps = objective_term_steps;
            newGoal.intake_full_id = intake_full_id;
            newGoal.treatment_plan_type = treatment_plan_type;
            newGoal.evaluating_progress = evaluating_progress;
            newGoal.reinforcers = reinforcers;
            newGoal.materials = materials;
            newGoal.progress_monitoring = progress_monitoring;
            newGoal.mastery_towards_goal_achievement = mastery_towards_goal_achievement;
            newGoal.expected_outcome = expected_outcome;
            newGoal.goal_comment = goal_comment;
            newGoal.present_level = present_level;
            newGoal.target_level = target_level;
            newGoal.consequences = consequences;
            savedGoal = await goalRepository.save(newGoal);
            if (!savedGoal) {
                const customError = new CustomError_1.CustomError(400, 'Raw', 'Error saving basic goal information', null, null);
                return next(customError);
            }
            const newFullPlan = new treatmentFullPlan_1.TreatmentFullPlan();
            const alreadyExistFullPlan = await fullPlanRepository.findOne({
                where: { id: treatment_full_id, treatment_plan_type, deleted_at: null },
            });
            if (!alreadyExistFullPlan) {
                const customError = new CustomError_1.CustomError(404, 'General', 'Treatment Plan Not Found', ['Treatment Plan not found']);
                return next(customError);
            }
            if (savedGoal) {
                if (!alreadyExistFullPlan.treatment_goal_ids) {
                    alreadyExistFullPlan.treatment_goal_ids = [];
                    alreadyExistFullPlan.treatment_goal_ids.push(savedGoal.id);
                    await fullPlanRepository.update(alreadyExistFullPlan.id, {
                        treatment_goal_ids: alreadyExistFullPlan.treatment_goal_ids,
                        status: genericEnums_1.Status.DRAFT,
                    });
                }
                else {
                    alreadyExistFullPlan.treatment_goal_ids.push(savedGoal.id);
                    await fullPlanRepository.update(alreadyExistFullPlan.id, {
                        treatment_goal_ids: alreadyExistFullPlan.treatment_goal_ids,
                        status: genericEnums_1.Status.DRAFT,
                    });
                }
            }
        }
        const savedGoals = await goalRepository.find({
            where: { intake_full_id, deleted_at: null },
        });
        return res.customSuccess(200, 'Goal Information successfully created.', savedGoals);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Treatment Goal Information', null, err);
        return next(customError);
    }
};
exports.addTreatmentGoal = addTreatmentGoal;
//# sourceMappingURL=addTreatmentGoals.js.map