import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TreatmentGoal } from 'orm/entities/TreatmentPlan/treatmentGoal';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const deleteTreatmentGoal = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const goal_id = req.params.goal_id;
    const goalRepository = getRepository(TreatmentGoal);

    const goal = await goalRepository.findOne({
      where: { id: goal_id },
    });

    if (!goal) {
      const customError = new CustomError(404, 'General', `Goal Information not found`, [
        'Goal Information not found.',
      ]);
      return next(customError);
    }

    await goalRepository.softDelete({ id: goal_id });

    return res.customSuccess(200, 'Treatment Goal Information successfully deleted.', null);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Treatment Goal Information', null, err);
    return next(customError);
  }
};
