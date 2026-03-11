import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { FcVisitGoal } from 'orm/entities/FCVisitLog/stepTwo/VisitGoal';
import { FcVisitFullForm } from 'orm/entities/FCVisitLog/fcVisitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editFcVisitGoal = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const { visitGoalArray } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;
    const visitGoalRepository = getRepository(FcVisitGoal);
    const visitFullFormRepository = getRepository(FcVisitFullForm);

    if (!visitGoalArray || visitGoalArray.length === 0) {
      const customError = new CustomError(400, 'General', `Visit Goal Array is empty`, ['Visit Goal Array is empty.']);
      return next(customError);
    }

    const visitExists = await visitFullFormRepository.findOne({
      where: { id: visitGoalArray[0]?.visit_full_form_id, deleted_at: null },
    });

    const savedVisitGoals = [];

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit Form not found`, ['Visit Form not found.']);
      return next(customError);
    }

    for (const goal of visitGoalArray) {
      let {
        short_term_objective,
        family_members_goal_discussed_with,
        current_teaching_methods_or_strategies,
        parent_or_family_members_challenges_when_implementing_strategies,
        training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies,
        additional_comments,
        visit_goal_id,
      } = goal;

      const visitGoalExists = await visitGoalRepository.findOne({ where: { id: visit_goal_id, deleted_at: null } });

      if (!visitGoalExists) {
        const customError = new CustomError(404, 'General', `Visit Goal not found`, ['Visit Goal not found.']);
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

      const visitGoal = new FcVisitGoal();

      visitGoal.short_term_objective = short_term_objective;
      visitGoal.family_members_goal_discussed_with = family_members_goal_discussed_with;
      visitGoal.current_teaching_methods_or_strategies = current_teaching_methods_or_strategies;
      visitGoal.parent_or_family_members_challenges_when_implementing_strategies =
        parent_or_family_members_challenges_when_implementing_strategies;
      visitGoal.training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies =
        training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies;
      visitGoal.additional_comments = additional_comments;
      visitGoal.account_id = account_id;
      visitGoal.status = Status.IN_PROGRESS;
      visitGoal.registered_by = registered_by;

      await visitGoalRepository.update(visit_goal_id, visitGoal);
      savedVisitGoals.push(visitGoal);
    }

    return res.customSuccess(200, 'Visit Goal successfully updated.', savedVisitGoals);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error updating FC Visit Goal', null, err);
    return next(customError);
  }
};
