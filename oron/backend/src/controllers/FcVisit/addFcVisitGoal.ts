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

export const addFcVisitGoal = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
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
      const {
        short_term_objective,
        family_members_goal_discussed_with,
        current_teaching_methods_or_strategies,
        parent_or_family_members_challenges_when_implementing_strategies,
        training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies,
        additional_comments,
        visit_full_form_id,
      } = goal;

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
      visitGoal.visit_full_form_id = visit_full_form_id;

      const savedVisitGoal = await visitGoalRepository.save(visitGoal);

      if (savedVisitGoal) {
        if (!visitExists.visit_goal_ids) {
          visitExists.visit_goal_ids = [];
          visitExists.visit_goal_ids.push(savedVisitGoal.id);
          await visitFullFormRepository.update(
            { id: visitExists.id },
            {
              visit_goal_ids: visitExists.visit_goal_ids,
            },
          );
        } else {
          visitExists.visit_goal_ids.push(savedVisitGoal.id);
          await visitFullFormRepository.update(
            { id: visitExists.id },
            {
              visit_goal_ids: visitExists.visit_goal_ids,
            },
          );
        }
      }
      savedVisitGoals.push(savedVisitGoal);
    }

    return res.customSuccess(200, 'FC Visit Goal successfully added.', savedVisitGoals);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding FC Visit Goal', null, err);
    return next(customError);
  }
};
