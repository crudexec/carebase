import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ConcernAndChallenges } from 'orm/entities/VisitLog/stepOne/concernAndChallenges';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addConcernAndChallenges = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const {
      was_there_any_concerns_or_challenges,
      supervisor_to_contact_during_session,
      describe_circumstances_involved,
      visit_full_form_id,
    } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;
    const concernAndChallengesRepository = getRepository(ConcernAndChallenges);
    const visitFullFormRepository = getRepository(VisitFullForm);

    const visitExists = await visitFullFormRepository.findOne({
      where: { id: visit_full_form_id, deleted_at: null },
    });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit Form not found`, ['Visit Form not found.']);
      return next(customError);
    }

    const concernAndChallenges = new ConcernAndChallenges();
    concernAndChallenges.was_there_any_concerns_or_challenges = was_there_any_concerns_or_challenges;
    concernAndChallenges.supervisor_to_contact_during_session = supervisor_to_contact_during_session;
    concernAndChallenges.describe_circumstances_involved = describe_circumstances_involved;
    concernAndChallenges.account_id = account_id;
    concernAndChallenges.visit_full_form_id = visit_full_form_id;
    concernAndChallenges.status = Status.IN_PROGRESS;
    concernAndChallenges.registered_by = registered_by;

    const savedConcernAndChallenges = await concernAndChallengesRepository.save(concernAndChallenges);

    if (savedConcernAndChallenges) {
      await visitFullFormRepository.update(visit_full_form_id, {
        concern_and_challenges_id: savedConcernAndChallenges.id,
      });
    }
    return res.customSuccess(200, 'Concerns and Challenges successfully added.', savedConcernAndChallenges);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Concerns And Challenges', null, err);
    return next(customError);
  }
};
