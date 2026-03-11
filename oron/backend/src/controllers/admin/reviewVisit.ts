import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewVisit = async (req: Request, res: Response, next: NextFunction) => {
  const visitRepository = getRepository(VisitFullForm);
  const userRepository = getRepository(User);

  const visit_id = req.params.id;
  const { review_notes } = req.body;

  try {
    const visit = await visitRepository.findOne({ where: { id: visit_id } });

    if (!visit) {
      const customError = new CustomError(404, 'General', 'Visit not found', ['Visit not found.']);
      return next(customError);
    }

    // Update status to DRAFT (allow re-editing) and save review notes
    await visitRepository.update(
      { id: visit_id },
      {
        status: Status.DRAFT,
        review_notes,
      },
    );

    // Send review email to submitter
    const submitter = await userRepository.findOne({ where: { id: visit.registered_by } });

    if (submitter) {
      await SendReviewEmail(submitter.first_name, 'Visit Note', review_notes, String(submitter.email));
    }

    return res.customSuccess(200, 'Visit review sent successfully.', visit);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error reviewing visit', null, err);
    return next(customError);
  }
};
