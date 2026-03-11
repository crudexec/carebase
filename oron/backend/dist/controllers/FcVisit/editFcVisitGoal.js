"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFcVisitGoal = void 0;
const typeorm_1 = require("typeorm");
const VisitGoal_1 = require("orm/entities/FCVisitLog/stepTwo/VisitGoal");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editFcVisitGoal = async (req, res, next) => {
    try {
        const { visitGoalArray } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const visitGoalRepository = (0, typeorm_1.getRepository)(VisitGoal_1.FcVisitGoal);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(fcVisitFullForm_1.FcVisitFullForm);
        if (!visitGoalArray || visitGoalArray.length === 0) {
            const customError = new CustomError_1.CustomError(400, 'General', `Visit Goal Array is empty`, ['Visit Goal Array is empty.']);
            return next(customError);
        }
        const visitExists = await visitFullFormRepository.findOne({
            where: { id: visitGoalArray[0]?.visit_full_form_id, deleted_at: null },
        });
        const savedVisitGoals = [];
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit Form not found`, ['Visit Form not found.']);
            return next(customError);
        }
        for (const goal of visitGoalArray) {
            let { short_term_objective, family_members_goal_discussed_with, current_teaching_methods_or_strategies, parent_or_family_members_challenges_when_implementing_strategies, training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies, additional_comments, visit_goal_id, } = goal;
            const visitGoalExists = await visitGoalRepository.findOne({ where: { id: visit_goal_id, deleted_at: null } });
            if (!visitGoalExists) {
                const customError = new CustomError_1.CustomError(404, 'General', `Visit Goal not found`, ['Visit Goal not found.']);
                return next(customError);
            }
            short_term_objective = short_term_objective ?? visitGoalExists.short_term_objective;
            family_members_goal_discussed_with =
                family_members_goal_discussed_with ?? visitGoalExists.family_members_goal_discussed_with;
            current_teaching_methods_or_strategies =
                current_teaching_methods_or_strategies ?? visitGoalExists.current_teaching_methods_or_strategies;
            parent_or_family_members_challenges_when_implementing_strategies =
                parent_or_family_members_challenges_when_implementing_strategies ??
                    visitGoalExists.parent_or_family_members_challenges_when_implementing_strategies;
            training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies =
                training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies ??
                    visitGoalExists.training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies;
            additional_comments = additional_comments ?? visitGoalExists.additional_comments;
            const visitGoal = new VisitGoal_1.FcVisitGoal();
            visitGoal.short_term_objective = short_term_objective;
            visitGoal.family_members_goal_discussed_with = family_members_goal_discussed_with;
            visitGoal.current_teaching_methods_or_strategies = current_teaching_methods_or_strategies;
            visitGoal.parent_or_family_members_challenges_when_implementing_strategies =
                parent_or_family_members_challenges_when_implementing_strategies;
            visitGoal.training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies =
                training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies;
            visitGoal.additional_comments = additional_comments;
            visitGoal.account_id = account_id;
            visitGoal.status = genericEnums_1.Status.IN_PROGRESS;
            visitGoal.registered_by = registered_by;
            await visitGoalRepository.update(visit_goal_id, visitGoal);
            savedVisitGoals.push(visitGoal);
        }
        return res.customSuccess(200, 'Visit Goal successfully updated.', savedVisitGoals);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error updating FC Visit Goal', null, err);
        return next(customError);
    }
};
exports.editFcVisitGoal = editFcVisitGoal;
//# sourceMappingURL=editFcVisitGoal.js.map