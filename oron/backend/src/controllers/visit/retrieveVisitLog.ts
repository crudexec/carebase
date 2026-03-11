import { Request, Response, NextFunction } from 'express';
import { getRepository, In } from 'typeorm';

import { BehaviorManagement } from 'orm/entities/VisitLog/stepOne/behaviorManagement';
import { VisitGoal } from 'orm/entities/VisitLog/stepThree/visitGoal';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveVisitLog = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const visit_full_id = req.params.visit_full_id;
    const visitFullFormRepository = getRepository(VisitFullForm);
    const behaviorManagementRepository = getRepository(BehaviorManagement);

    const visitGoalRepository = getRepository(VisitGoal);

    const visitGoalsArray = [];

    const visitFullForm = await visitFullFormRepository.findOne({
      where: { id: visit_full_id },
      relations: [
        'sessionHighlights',
        'selfManagement',
        'communication',
        'concernAndChallenges',
        'domesticSkillTraining',
        'playLeisure',
        'snackMealTime',
        'utilizationOfMoney',
        'socialization',
        'safetyAndSurvivalSkills',
        'personalCareAndBladderControl',
        'sensoryNeedAndMotorDevelopment',
        'personalWorkReading',
        'transportationTypeAndObjectives',
      ],
    });

    const { visit_goal_ids } = visitFullForm;

    if (Array.isArray(visit_goal_ids) && visit_goal_ids.length > 0) {
      const visitGoals = await visitGoalRepository.find({
        where: { id: In(visit_goal_ids) },
      });
      visitGoalsArray.push(...visitGoals);
    }

    if (!visitFullForm) {
      const customError = new CustomError(404, 'General', `Visit Form not found`, ['Visit Form not found.']);
      return next(customError);
    }

    const { behavior_management_ids } = visitFullForm;

    const behaviors = [];

    if (Array.isArray(behavior_management_ids) && behavior_management_ids.length > 0) {
      const behaviorManagements = await behaviorManagementRepository.find({
        where: { id: In(behavior_management_ids) },
      });
      behaviors.push(...behaviorManagements);
    }

    visitFullForm['behaviorManagement'] = behaviors;
    visitFullForm['visitGoals'] = visitGoalsArray;

    return res.customSuccess(200, 'Visit Form successfully retrieved.', visitFullForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error retrieving visit logs', null, err);
    return next(customError);
  }
};
