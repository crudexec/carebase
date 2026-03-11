import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { FcVisitFullForm } from 'orm/entities/FCVisitLog/fcVisitFullForm';
import { FcVisitGoal } from 'orm/entities/FCVisitLog/stepTwo/VisitGoal';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { FcFamilyDiscussion } from 'orm/entities/FCVisitLog/stepOne/FamilyDiscussion';
import { FcOtherTraining } from 'orm/entities/FCVisitLog/stepThree/otherTraining';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveFcVisitLog = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const visit_full_id = req.params.visit_full_id;
    const visitFullFormRepository = await getRepository(FcVisitFullForm);

    const visitGoalRepository = await getRepository(FcVisitGoal);

    const visitGoalsArray = [];

    const visitFullForm = await visitFullFormRepository.findOne({
      where: { id: visit_full_id },
      relations: ['sessionHighlights', 'treatmentPlanSignature', 'familyDiscussion', 'otherTraining'],
    });

    const { visit_goal_ids } = visitFullForm;

    if (Array.isArray(visit_goal_ids) && visit_goal_ids.length > 0) {
      for (const goal of visit_goal_ids) {
        const visitGoal = await visitGoalRepository.findOne({
          where: { id: goal },
        });

        visitGoalsArray.push(visitGoal);
      }
    }

    if (!visitFullForm) {
      const customError = new CustomError(404, 'General', `Visit Form not found`, ['Visit Form not found.']);
      return next(customError);
    }
    visitFullForm['visitGoals'] = visitGoalsArray;

    return res.customSuccess(200, 'FC Visit Form successfully retrieved.', visitFullForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error retrieving FC visit logs', null, err);
    return next(customError);
  }
};
