import { Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';

import { TreatmentSchedule } from 'orm/entities/TreatmentPlan/treatmentSchedule';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editTreatmentSchedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  try {
    await queryRunner.startTransaction();
    let { end_date, start_date, time_slot } = req.body;
    const form_id = req.params.form_id;
    const scheduleRepository = connection.getRepository(TreatmentSchedule);

    const alreadyExistingSchedule = await scheduleRepository.findOne({
      where: { id: form_id },
    });

    if (!alreadyExistingSchedule) {
      const customError = new CustomError(404, 'General', `Schedule Information not found`, [
        'Schedule Information not found.',
      ]);
      return next(customError);
    }

    end_date = end_date ?? alreadyExistingSchedule.end_date;
    start_date = start_date ?? alreadyExistingSchedule.start_date;
    time_slot = time_slot ?? alreadyExistingSchedule.time_slot;

    const newSchedule = new TreatmentSchedule();

    newSchedule.end_date = end_date;
    newSchedule.start_date = start_date;
    newSchedule.time_slot = time_slot;

    await scheduleRepository.update(form_id, newSchedule);

    await queryRunner.commitTransaction();

    return res.customSuccess(200, 'Schedule Information successfully updated.', newSchedule);
  } catch (err) {
    await queryRunner.rollbackTransaction();
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Treatment Schedule Information', null, err);
    return next(customError);
  } finally {
    await queryRunner.release();
  }
};
