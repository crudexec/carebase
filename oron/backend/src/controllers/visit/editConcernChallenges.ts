import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ConcernAndChallenges } from 'orm/entities/VisitLog/stepOne/concernAndChallenges';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editConcernAndChallenges = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let {
      was_there_any_concerns_or_challenges,
      supervisor_to_contact_during_session,
      describe_circumstances_involved,
      concern_and_challenges_id,
    } = req.body;

    const concernAndChallengesRepository = getRepository(ConcernAndChallenges);

    const alreadyExistingConcernAndChallenges = await concernAndChallengesRepository.findOne({
      where: { id: concern_and_challenges_id, deleted_at: null },
    });

    if (!alreadyExistingConcernAndChallenges) {
      const customError = new CustomError(404, 'General', `Concerns and Challenges not found`, [
        'Concerns and Challenges not found.',
      ]);
      return next(customError);
    }

    was_there_any_concerns_or_challenges =
      was_there_any_concerns_or_challenges ?? alreadyExistingConcernAndChallenges.was_there_any_concerns_or_challenges;
    supervisor_to_contact_during_session =
      supervisor_to_contact_during_session ?? alreadyExistingConcernAndChallenges.supervisor_to_contact_during_session;

    describe_circumstances_involved =
      describe_circumstances_involved ?? alreadyExistingConcernAndChallenges.describe_circumstances_involved;

    const concernAndChallenges = new ConcernAndChallenges();

    concernAndChallenges.was_there_any_concerns_or_challenges = was_there_any_concerns_or_challenges;
    concernAndChallenges.supervisor_to_contact_during_session = supervisor_to_contact_during_session;
    concernAndChallenges.describe_circumstances_involved = describe_circumstances_involved;

    await concernAndChallengesRepository.update(concern_and_challenges_id, concernAndChallenges);

    return res.customSuccess(200, 'Concerns and Challenges successfully updated.', concernAndChallenges);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Concerns And Challenges', null, err);
    return next(customError);
  }
};
