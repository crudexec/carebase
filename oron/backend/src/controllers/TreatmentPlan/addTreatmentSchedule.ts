import { Request, Response, NextFunction } from 'express';
import { getConnection, getRepository } from 'typeorm';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { TreatmentSchedule } from 'orm/entities/TreatmentPlan/treatmentSchedule';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addTreatmentSchedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  try {
    await queryRunner.startTransaction();
    const user_id = req.user.id;
    const intake_full_id = req.params.intake_full_id;
    const { end_date, start_date, time_slot, treatment_plan_type, treatment_full_id } = req.body;
    const scheduleRepository = getRepository(TreatmentSchedule);
    const fullPlanRepository = connection.getRepository(TreatmentFullPlan);

    // const alreadyExistSchedule = await scheduleRepository.findOne({
    //   where: { intake_full_id },
    // });

    // if (alreadyExistSchedule) {
    //   const customError = new CustomError(400, 'Raw', 'Treatment Schedule already exist', null, null);
    //   return next(customError);
    // }

    const newSchedule = new TreatmentSchedule();

    newSchedule.registered_by = user_id;
    newSchedule.end_date = end_date;
    newSchedule.start_date = start_date;
    newSchedule.time_slot = time_slot;
    newSchedule.intake_full_id = intake_full_id;
    newSchedule.treatment_plan_type = treatment_plan_type;

    const savedSchedule = await scheduleRepository.save(newSchedule);

    if (!savedSchedule) {
      const customError = new CustomError(400, 'Raw', 'Error saving basic schedule information', null, null);
      return next(customError);
    }

    const newFullPlan = new TreatmentFullPlan();

    const alreadyExistFullPlan = await fullPlanRepository.findOne({
      where: { id: treatment_full_id, treatment_plan_type, deleted_at: null },
    });

    if (!alreadyExistFullPlan) {
      const customError = new CustomError(404, 'General', 'Treatment Plan Not Found', ['Treatment Plan not found']);
      return next(customError);
    }

    newFullPlan.treatment_schedule_id = savedSchedule.id;
    newFullPlan.treatment_plan_type = treatment_plan_type;
    newFullPlan.status = Status.DRAFT;
    await fullPlanRepository.update(alreadyExistFullPlan.id, newFullPlan);

    await queryRunner.commitTransaction();

    return res.customSuccess(200, 'Schedule Information successfully created.', savedSchedule);
  } catch (err) {
    await queryRunner.rollbackTransaction();
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Treatment Schedule Information', null, err);
    return next(customError);
  } finally {
    await queryRunner.release();
  }
};
