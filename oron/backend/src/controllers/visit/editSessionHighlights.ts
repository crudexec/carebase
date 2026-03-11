import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { SessionHighlights } from 'orm/entities/VisitLog/stepOne/sessionHighlights';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editSessionHighlights = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let {
      location,
      level_of_compliance,
      injury_to_self,
      aggression_to_others,
      client_hospitalized_in_care_today,
      client_placed_themselves_in_harm_by_leaving_my_care,
      session_highlights_id,
    } = req.body;

    const sessionHighlightsRepository = getRepository(SessionHighlights);

    const alreadyExistingSessionHighlights = await sessionHighlightsRepository.findOne({
      where: { id: session_highlights_id, deleted_at: null },
    });

    if (!alreadyExistingSessionHighlights) {
      const customError = new CustomError(404, 'General', `Session Highlights not found`, [
        'Session Highlights not found.',
      ]);
      return next(customError);
    }

    location = location ?? alreadyExistingSessionHighlights.location;
    level_of_compliance = level_of_compliance ?? alreadyExistingSessionHighlights.level_of_compliance;
    injury_to_self = injury_to_self ?? alreadyExistingSessionHighlights.injury_to_self;
    aggression_to_others = aggression_to_others ?? alreadyExistingSessionHighlights.aggression_to_others;
    client_hospitalized_in_care_today =
      client_hospitalized_in_care_today ?? alreadyExistingSessionHighlights.client_hospitalized_in_care_today;
    client_placed_themselves_in_harm_by_leaving_my_care =
      client_placed_themselves_in_harm_by_leaving_my_care ??
      alreadyExistingSessionHighlights.client_placed_themselves_in_harm_by_leaving_my_care;

    const sessionHighlights = new SessionHighlights();
    sessionHighlights.location = location;
    sessionHighlights.level_of_compliance = level_of_compliance;
    sessionHighlights.injury_to_self = injury_to_self;
    sessionHighlights.aggression_to_others = aggression_to_others;
    sessionHighlights.client_hospitalized_in_care_today = client_hospitalized_in_care_today;
    sessionHighlights.client_placed_themselves_in_harm_by_leaving_my_care =
      client_placed_themselves_in_harm_by_leaving_my_care;

    await sessionHighlightsRepository.update(session_highlights_id, sessionHighlights);

    return res.customSuccess(200, 'Session Highlights successfully updated.', sessionHighlights);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Session Highlights', null, err);
    return next(customError);
  }
};
