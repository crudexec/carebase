import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { validateVisitForSubmission } from 'services/visit/validateVisitSubmission';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitGenericVisit = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const visitFullFormRepository = getRepository(VisitFullForm);

    const { visit_full_form_id } = req.body;
    const account_id = req.user.account_id;

    const visitExists = await visitFullFormRepository.findOne({
      where: { id: visit_full_form_id, account_id, deleted_at: null },
    });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit form with this ${visit_full_form_id} does not exist`, [
        'Visit not found.',
      ]);
      return next(customError);
    }

    // Run validation before submission
    const validation = await validateVisitForSubmission(visit_full_form_id);

    if (!validation.valid) {
      const customError = new CustomError(400, 'Validation', 'Visit submission validation failed', validation.errors);
      return next(customError);
    }

    // Update status to AWAITING_APPROVAL instead of COMPLETED
    await visitFullFormRepository.update(
      { id: visit_full_form_id },
      {
        status: Status.AWAITING_APPROVAL,
      },
    );

    return res.status(200).json({
      message: 'Visit Submitted Successfully - Awaiting Admin Approval',
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Submitting Visit', null, err);
    return next(customError);
  }
};
