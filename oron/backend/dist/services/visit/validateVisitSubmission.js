"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVisitForSubmission = void 0;
const typeorm_1 = require("typeorm");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const visitGoal_1 = require("orm/entities/VisitLog/stepThree/visitGoal");
const validateVisitForSubmission = async (visit_full_form_id) => {
    const errors = [];
    try {
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const visitGoalRepository = (0, typeorm_1.getRepository)(visitGoal_1.VisitGoal);
        const visitFullForm = await visitFullFormRepository.findOne({
            where: { id: visit_full_form_id },
        });
        if (!visitFullForm) {
            errors.push('Visit form not found');
            return { valid: false, errors };
        }
        const { visit_goal_ids } = visitFullForm;
        if (!Array.isArray(visit_goal_ids) || visit_goal_ids.length < 2) {
            errors.push('Visit requires at least 2 goals to submit');
            return { valid: false, errors };
        }
        const visitGoals = await visitGoalRepository.find({
            where: { id: (0, typeorm_1.In)(visit_goal_ids) },
        });
        if (visitGoals.length < 2) {
            errors.push('Visit requires at least 2 goals to submit');
            return { valid: false, errors };
        }
        visitGoals.forEach((goal, index) => {
            const goalNum = index + 1;
            let goalSteps = [];
            if (typeof goal.goal_steps === 'string') {
                try {
                    goalSteps = JSON.parse(goal.goal_steps);
                }
                catch (e) {
                    goalSteps = [];
                }
            }
            else if (Array.isArray(goal.goal_steps)) {
                goalSteps = goal.goal_steps;
            }
            const validSteps = goalSteps.filter((step) => {
                if (step.response === 'Yes' || step.response === 'yes') {
                    if (!step.prompt_used || step.prompt_used.trim() === '') {
                        return false;
                    }
                    const success = parseInt(step.success);
                    if (isNaN(success) || success < 1 || success > 10) {
                        return false;
                    }
                    const opportunities = parseInt(step.opportunities);
                    if (isNaN(opportunities) || opportunities < 1 || opportunities > 10) {
                        return false;
                    }
                    return true;
                }
                return false;
            });
            if (validSteps.length === 0) {
                errors.push(`Goal ${goalNum}: Must have at least one step with response "Yes" and all fields filled (prompt used, success 1-10, opportunities 1-10)`);
            }
        });
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    catch (err) {
        errors.push('Error validating visit: ' + (err.message || 'Unknown error'));
        return { valid: false, errors };
    }
};
exports.validateVisitForSubmission = validateVisitForSubmission;
//# sourceMappingURL=validateVisitSubmission.js.map