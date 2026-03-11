import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { FcSessionHighlights } from 'orm/entities/FCVisitLog/stepOne/SessionHighlights';
import { FcVisitFullForm } from 'orm/entities/FCVisitLog/fcVisitFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addFcSessionHighlights = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const { session_ocurred_in, those_present_for_the_family_consultant_session, visit_full_form_id } = req.body;
    const registered_by = req.user.id;
    const FcsessionHighlightsRepository = getRepository(FcSessionHighlights);
    const visitFullFormRepository = getRepository(FcVisitFullForm);

    function isValidUUID(uuid) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    }

    if (!isValidUUID(visit_full_form_id)) {
      const customError = new CustomError(400, 'Raw', 'Invalid Visit ID', ['Invalid Visit ID.']);
      return next(customError);
    }

    if (!visit_full_form_id) {
      const customError = new CustomError(400, 'Raw', 'Visit ID is required', ['Visit ID is required.']);
      return next(customError);
    }

    const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
      return next(customError);
    }

    const FcsessionHighlights = new FcSessionHighlights();
    FcsessionHighlights.session_ocurred_in = session_ocurred_in;
    FcsessionHighlights.those_present_for_the_family_consultant_session =
      those_present_for_the_family_consultant_session;
    FcsessionHighlights.registered_by = registered_by;
    FcsessionHighlights.visit_full_form_id = visit_full_form_id;

    const savedFcSessionHighlights = await FcsessionHighlightsRepository.save(FcsessionHighlights);

    if (savedFcSessionHighlights) {
      await visitFullFormRepository.update(visit_full_form_id, { session_highlights_id: savedFcSessionHighlights.id });
    }
    return res.customSuccess(200, 'Session Highlights successfully added.', savedFcSessionHighlights);
  } catch (err) {
    console.log('Error Adding Session Highlights', err);
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Session Highlights', null, err);
    return next(customError);
  }
};
