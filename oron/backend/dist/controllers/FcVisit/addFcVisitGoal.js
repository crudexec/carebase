"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFcVisitGoal = void 0;
const typeorm_1 = require("typeorm");
const VisitGoal_1 = require("orm/entities/FCVisitLog/stepTwo/VisitGoal");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addFcVisitGoal = async (req, res, next) => {
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
            const { short_term_objective, family_members_goal_discussed_with, current_teaching_methods_or_strategies, parent_or_family_members_challenges_when_implementing_strategies, training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies, additional_comments, visit_full_form_id, } = goal;
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
            visitGoal.visit_full_form_id = visit_full_form_id;
            const savedVisitGoal = await visitGoalRepository.save(visitGoal);
            if (savedVisitGoal) {
                if (!visitExists.visit_goal_ids) {
                    visitExists.visit_goal_ids = [];
                    visitExists.visit_goal_ids.push(savedVisitGoal.id);
                    await visitFullFormRepository.update({ id: visitExists.id }, {
                        visit_goal_ids: visitExists.visit_goal_ids,
                    });
                }
                else {
                    visitExists.visit_goal_ids.push(savedVisitGoal.id);
                    await visitFullFormRepository.update({ id: visitExists.id }, {
                        visit_goal_ids: visitExists.visit_goal_ids,
                    });
                }
            }
            savedVisitGoals.push(savedVisitGoal);
        }
        return res.customSuccess(200, 'FC Visit Goal successfully added.', savedVisitGoals);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding FC Visit Goal', null, err);
        return next(customError);
    }
};
exports.addFcVisitGoal = addFcVisitGoal;
//# sourceMappingURL=addFcVisitGoal.js.map