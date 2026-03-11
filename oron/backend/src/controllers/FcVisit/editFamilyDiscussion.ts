import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { FcFamilyDiscussion } from 'orm/entities/FCVisitLog/stepOne/FamilyDiscussion';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { FcVisitFullForm } from 'orm/entities/FCVisitLog/fcVisitFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editFcFamilyDiscussion = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let {
      accomplishments_client_family_made_void_of_family_consultation_treatment,
      accomplishments_client_made_void_of_family_consultation_treatment,
      topic_not_related_discussed_during_family_consultation,
      family_discussion_id,
    } = req.body;

    const account_id = req.user.account_id;
    const registered_by = req.user.id;
    const FcFamilyDiscussionRepository = getRepository(FcFamilyDiscussion);
    const visitFullFormRepository = getRepository(FcVisitFullForm);

    const alreadyExistingFcFamilyDiscussion = await FcFamilyDiscussionRepository.findOne({
      where: { id: family_discussion_id, deleted_at: null },
    });
    if (!alreadyExistingFcFamilyDiscussion) {
      const customError = new CustomError(404, 'General', `Family Discussion not found`, [
        'Family Discussion not found.',
      ]);
      return next(customError);
    }

    accomplishments_client_family_made_void_of_family_consultation_treatment =
      accomplishments_client_family_made_void_of_family_consultation_treatment ??
      alreadyExistingFcFamilyDiscussion.accomplishments_client_family_made_void_of_family_consultation_treatment;
    accomplishments_client_made_void_of_family_consultation_treatment =
      accomplishments_client_made_void_of_family_consultation_treatment ??
      alreadyExistingFcFamilyDiscussion.accomplishments_client_made_void_of_family_consultation_treatment;
    topic_not_related_discussed_during_family_consultation =
      topic_not_related_discussed_during_family_consultation ??
      alreadyExistingFcFamilyDiscussion.topic_not_related_discussed_during_family_consultation;

    const FamilyDiscussion = new FcFamilyDiscussion();

    FamilyDiscussion.accomplishments_client_family_made_void_of_family_consultation_treatment =
      accomplishments_client_family_made_void_of_family_consultation_treatment;
    FamilyDiscussion.accomplishments_client_made_void_of_family_consultation_treatment =
      accomplishments_client_made_void_of_family_consultation_treatment;
    FamilyDiscussion.topic_not_related_discussed_during_family_consultation =
      topic_not_related_discussed_during_family_consultation;
    FamilyDiscussion.registered_by = registered_by;

    await FcFamilyDiscussionRepository.update(family_discussion_id, FamilyDiscussion);

    return res.customSuccess(200, 'Family Discussion successfully updated.', FamilyDiscussion);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Family Discussion', null, err);
    return next(customError);
  }
};
