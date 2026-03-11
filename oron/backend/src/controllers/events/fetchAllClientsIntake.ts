import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ClientStaffAssignment } from 'orm/entities/ClientStaffAssignment';
import { Role } from 'orm/entities/types';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fetchAllClientsIntake = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const account_id = req.user.account_id;
    const user_id = req.user.id;
    const user_role = req.user.role;

    const intakeFullFormRepository = getRepository(IntakeFullForm);
    const treatmentFullPlanRepository = getRepository(TreatmentFullPlan);

    const intakeDataArray = [];

    let intakes;

    // If user is STANDARD role, filter by assignments
    if (user_role === Role.STANDARD) {
      const assignmentRepository = getRepository(ClientStaffAssignment);
      const assignments = await assignmentRepository.find({
        where: { staff_id: user_id, is_active: true },
        select: ["client_id"],
      });

      const assignedClientIds = assignments.map(a => a.client_id);

      if (assignedClientIds.length === 0) {
        // Staff has no assignments, return empty result
        return res.customSuccess(200, 'Clients Intake Retrieved Successfully', []);
      }

      // Filter intakes to only assigned clients
      intakes = await intakeFullFormRepository
        .createQueryBuilder('intake')
        .where('intake.account_id = :account_id', { account_id })
        .andWhere('intake.id IN (:...assignedClientIds)', { assignedClientIds })
        .andWhere('intake.deleted_at IS NULL')
        .getMany();
    } else {
      // Admins and Client Managers see all clients
      intakes = await intakeFullFormRepository.find({ where: { account_id, deleted_at: null } });
    }
    let temp = {};
    for (const intake of intakes) {
      const treatmentPlan = await treatmentFullPlanRepository.findOne({
        where: { intake_full_id: intake.id, deleted_at: null },
      });
      if (treatmentPlan) {
        temp = { ...intake, treatment_plan_exists: true };
      } else {
        temp = { ...intake, treatment_plan_exists: false };
      }
      intakeDataArray.push(temp);
    }

    return res.customSuccess(200, 'Clients Intake Retrieved Successfully', intakeDataArray);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Retrieving Intakes', null, err);
    return next(customError);
  }
};
