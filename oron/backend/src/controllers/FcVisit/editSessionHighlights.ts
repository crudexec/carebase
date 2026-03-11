import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { FcSessionHighlights } from 'orm/entities/FCVisitLog/stepOne/SessionHighlights';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editFcSessionHighlights = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let { session_ocurred_in, those_present_for_the_family_consultant_session, fc_session_id } = req.body;
    const account_id = req.user.account_id;
    const FcsessionHighlightsRepository = getRepository(FcSessionHighlights);

    const alreadyExistingFcSessionHighlights = await FcsessionHighlightsRepository.findOne({
      where: { id: fc_session_id, deleted_at: null },
    });

    if (!alreadyExistingFcSessionHighlights) {
      const customError = new CustomError(404, 'General', `Session Highlights not found`, [
        'Session Highlights not found.',
      ]);
      return next(customError);
    }

    session_ocurred_in = session_ocurred_in ?? alreadyExistingFcSessionHighlights.session_ocurred_in;
    those_present_for_the_family_consultant_session =
      those_present_for_the_family_consultant_session ??
      alreadyExistingFcSessionHighlights.those_present_for_the_family_consultant_session;

    alreadyExistingFcSessionHighlights.session_ocurred_in = session_ocurred_in;
    alreadyExistingFcSessionHighlights.those_present_for_the_family_consultant_session =
      those_present_for_the_family_consultant_session;

    await FcsessionHighlightsRepository.update(fc_session_id, alreadyExistingFcSessionHighlights);

    return res.customSuccess(200, 'Session Highlights successfully updated.', alreadyExistingFcSessionHighlights);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Session Highlights', null, err);
    return next(customError);
  }
};
