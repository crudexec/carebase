import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { SelfManagement } from 'orm/entities/VisitLog/stepOne/selfManagement';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editSelfManagement = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let {
      responding_to_others,
      sharing,
      increasing_on_task_behavior,
      initiating_interactions,
      conversing_with_others,
      increasing_play_skills,
      promoting_daily_living_skills,
      taking_turns,
      following_the_rules,
      reducing_occurence_of_interfering_behavior,
      cooperate_with_peers_in_group_activity,
      other,
      self_management_id,
    } = req.body;

    const selfManagementRepository = getRepository(SelfManagement);

    const selfManagement = new SelfManagement();

    const alreadyExistingSelfManagement = await selfManagementRepository.findOne({
      where: { id: self_management_id, deleted_at: null },
    });

    if (!alreadyExistingSelfManagement) {
      const customError = new CustomError(404, 'General', `Self Management not found`, ['Self Management not found.']);
      return next(customError);
    }

    responding_to_others = responding_to_others ?? alreadyExistingSelfManagement.responding_to_others;
    sharing = sharing ?? alreadyExistingSelfManagement.sharing;
    increasing_on_task_behavior =
      increasing_on_task_behavior ?? alreadyExistingSelfManagement.increasing_on_task_behavior;
    initiating_interactions = initiating_interactions ?? alreadyExistingSelfManagement.initiating_interactions;
    conversing_with_others = conversing_with_others ?? alreadyExistingSelfManagement.conversing_with_others;
    increasing_play_skills = increasing_play_skills ?? alreadyExistingSelfManagement.increasing_play_skills;
    promoting_daily_living_skills =
      promoting_daily_living_skills ?? alreadyExistingSelfManagement.promoting_daily_living_skills;
    taking_turns = taking_turns ?? alreadyExistingSelfManagement.taking_turns;
    following_the_rules = following_the_rules ?? alreadyExistingSelfManagement.following_the_rules;
    reducing_occurence_of_interfering_behavior =
      reducing_occurence_of_interfering_behavior ??
      alreadyExistingSelfManagement.reducing_occurence_of_interfering_behavior;
    cooperate_with_peers_in_group_activity =
      cooperate_with_peers_in_group_activity ?? alreadyExistingSelfManagement.cooperate_with_peers_in_group_activity;
    other = other ?? alreadyExistingSelfManagement.other;

    selfManagement.responding_to_others = responding_to_others;
    selfManagement.sharing = sharing;
    selfManagement.increasing_on_task_behavior = increasing_on_task_behavior;
    selfManagement.initiating_interactions = initiating_interactions;
    selfManagement.conversing_with_others = conversing_with_others;
    selfManagement.increasing_play_skills = increasing_play_skills;
    selfManagement.promoting_daily_living_skills = promoting_daily_living_skills;
    selfManagement.taking_turns = taking_turns;
    selfManagement.following_the_rules = following_the_rules;
    selfManagement.reducing_occurence_of_interfering_behavior = reducing_occurence_of_interfering_behavior;
    selfManagement.cooperate_with_peers_in_group_activity = cooperate_with_peers_in_group_activity;
    selfManagement.other = other;

    await selfManagementRepository.update(self_management_id, selfManagement);

    return res.customSuccess(200, 'Self Management successfully updated.', selfManagement);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Self Management', null, err);
    return next(customError);
  }
};
