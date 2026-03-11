import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UserDocument } from 'orm/entities/Documents';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewUserDocument = async (req: Request, res: Response, next: NextFunction) => {
  const userDocumentRepository = getRepository(UserDocument);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  const { review_notes } = req.body;

  try {
    const userDocumentData = await userDocumentRepository.findOne({
      where: {
        id: form_id,
        deleted_at: null,
      },
    });

    if (!userDocumentData) {
      const customError = new CustomError(404, 'General', `User Document Not Found`, ['User Document not found.']);
      return next(customError);
    }

    await userDocumentRepository.update(
      {
        id: form_id,
      },
      { status: Status.REVIEWED, review_notes },
    );

    const user = await userRepository.findOne({ where: { id: userDocumentData.owner } });

    if (!user) {
      const customError = new CustomError(404, 'General', `User not found.`, ['User not found.']);
      return next(customError);
    }

    await SendReviewEmail(user.first_name, `${userDocumentData.document_title}`, review_notes, String(user.email));

    return res.customSuccess(200, `${userDocumentData.document_title} successfully reviewed.`, userDocumentData);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Reviewing user document', null, err);
    return next(customError);
  }
};
