"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVisitGoal = void 0;
const typeorm_1 = require("typeorm");
const visitGoal_1 = require("orm/entities/VisitLog/stepThree/visitGoal");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addVisitGoal = async (req, res, next) => {
    try {
        const { visitGoalArray } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const visitGoalRepository = (0, typeorm_1.getRepository)(visitGoal_1.VisitGoal);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
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
            const { where_was_the_activity_practiced, indicate_circumstances_leading_to_activity, client_response_or_reaction_was, consequently_client_did, total_time_spent_on_activity, client_reward, goal_steps, additional_comments, goal_background, short_term_objective, visit_full_form_id, } = goal;
            const visitGoal = new visitGoal_1.VisitGoal();
            visitGoal.where_was_the_activity_practiced = where_was_the_activity_practiced;
            visitGoal.indicate_circumstances_leading_to_activity = indicate_circumstances_leading_to_activity;
            visitGoal.client_response_or_reaction_was = client_response_or_reaction_was;
            visitGoal.consequently_client_did = consequently_client_did;
            visitGoal.total_time_spent_on_activity = total_time_spent_on_activity;
            visitGoal.client_reward = client_reward;
            visitGoal.goal_steps = goal_steps;
            visitGoal.additional_comments = additional_comments;
            visitGoal.goal_background = goal_background;
            visitGoal.short_term_objective = short_term_objective;
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
        return res.customSuccess(200, 'Visit Goal successfully added.', savedVisitGoals);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Visit Goal', null, err);
        return next(customError);
    }
};
exports.addVisitGoal = addVisitGoal;
//# sourceMappingURL=addVisitGoal.js.map