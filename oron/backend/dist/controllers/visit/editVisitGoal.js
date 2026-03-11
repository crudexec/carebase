"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editVisitGoal = void 0;
const typeorm_1 = require("typeorm");
const visitGoal_1 = require("orm/entities/VisitLog/stepThree/visitGoal");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editVisitGoal = async (req, res, next) => {
    try {
        let { where_was_the_activity_practiced, indicate_circumstances_leading_to_activity, client_response_or_reaction_was, consequently_client_did, total_time_spent_on_activity, client_reward, goal_steps, additional_comments, goal_background, short_term_objective, visit_goal_id, } = req.body;
        const visitGoalRepository = (0, typeorm_1.getRepository)(visitGoal_1.VisitGoal);
        const visitGoalExists = await visitGoalRepository.findOne({ where: { id: visit_goal_id, deleted_at: null } });
        if (!visitGoalExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit Goal not found`, ['Visit Goal not found.']);
            return next(customError);
        }
        where_was_the_activity_practiced =
            where_was_the_activity_practiced ?? visitGoalExists.where_was_the_activity_practiced;
        indicate_circumstances_leading_to_activity =
            indicate_circumstances_leading_to_activity ?? visitGoalExists.indicate_circumstances_leading_to_activity;
        client_response_or_reaction_was =
            client_response_or_reaction_was ?? visitGoalExists.client_response_or_reaction_was;
        consequently_client_did = consequently_client_did ?? visitGoalExists.consequently_client_did;
        total_time_spent_on_activity = total_time_spent_on_activity ?? visitGoalExists.total_time_spent_on_activity;
        client_reward = client_reward ?? visitGoalExists.client_reward;
        goal_steps = goal_steps ?? visitGoalExists.goal_steps;
        additional_comments = additional_comments ?? visitGoalExists.additional_comments;
        goal_background = goal_background ?? visitGoalExists.goal_background;
        short_term_objective = short_term_objective ?? visitGoalExists.short_term_objective;
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
        await visitGoalRepository.update(visit_goal_id, visitGoal);
        return res.customSuccess(200, 'Visit Goal successfully updated.', visitGoal);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Editing Visit Goal', null, err);
        return next(customError);
    }
};
exports.editVisitGoal = editVisitGoal;
//# sourceMappingURL=editVisitGoal.js.map