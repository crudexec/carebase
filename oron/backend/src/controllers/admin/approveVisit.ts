import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { sendApproveMail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const ApproveVisit = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const visitRepository = getRepository(VisitFullForm);
  const userRepository = getRepository(User);

  const visit_id = req.params.id;
  const admin_id = req.user.id;

  try {
    // Find visit with registered user relation
    const visit = await visitRepository.findOne({
      where: { id: visit_id },
      relations: ['user'],
    });

    if (!visit) {
      const customError = new CustomError(404, 'General', 'Visit not found', ['Visit not found.']);
      return next(customError);
    }

    // Check current status
    if (visit.status !== Status.AWAITING_APPROVAL) {
      const customError = new CustomError(400, 'General', 'Visit is not in awaiting approval status', [
        `Current status: ${visit.status}`,
      ]);
      return next(customError);
    }

    // Update to approved status
    await visitRepository.update(
      { id: visit_id },
      {
        status: Status.APPROVED,
        approved_by: admin_id,
        approved_at: new Date(),
      },
    );

    // Send email notification to submitter
    const submitter = await userRepository.findOne({ where: { id: visit.registered_by } });

    if (submitter) {
      await sendApproveMail(submitter.first_name, 'Visit Note', String(submitter.email));
    }

    return res.customSuccess(200, 'Visit successfully approved.', visit);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error approving visit', null, err);
    return next(customError);
  }
};
