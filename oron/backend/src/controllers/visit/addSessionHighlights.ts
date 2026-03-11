import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { SessionHighlights } from 'orm/entities/VisitLog/stepOne/sessionHighlights';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addSessionHighlights = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const {
      location,
      level_of_compliance,
      injury_to_self,
      aggression_to_others,
      client_hospitalized_in_care_today,
      client_placed_themselves_in_harm_by_leaving_my_care,
      visit_full_form_id,
    } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;
    const sessionHighlightsRepository = getRepository(SessionHighlights);
    const visitFullFormRepository = getRepository(VisitFullForm);

    const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
      return next(customError);
    }

    const sessionHighlights = new SessionHighlights();
    sessionHighlights.location = location;
    sessionHighlights.level_of_compliance = level_of_compliance;
    sessionHighlights.injury_to_self = injury_to_self;
    sessionHighlights.aggression_to_others = aggression_to_others;
    sessionHighlights.client_hospitalized_in_care_today = client_hospitalized_in_care_today;
    sessionHighlights.client_placed_themselves_in_harm_by_leaving_my_care =
      client_placed_themselves_in_harm_by_leaving_my_care;
    sessionHighlights.account_id = account_id;
    sessionHighlights.status = Status.IN_PROGRESS;
    sessionHighlights.registered_by = registered_by;
    sessionHighlights.visit_full_form_id = visit_full_form_id;

    const savedSessionHighlights = await sessionHighlightsRepository.save(sessionHighlights);

    if (savedSessionHighlights) {
      await visitFullFormRepository.update(visit_full_form_id, { session_highlights_id: savedSessionHighlights.id });
    }
    return res.customSuccess(200, 'Session Highlights successfully added.', savedSessionHighlights);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Session Highlights', null, err);
    return next(customError);
  }
};
