import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const createGenericTreatmentFullPlan = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const { intake_full_id, treatment_plan_type, tp_implemented_by, tp_type } = req.body;
    const registered_by = req.user.id;
    const treatmentFullPlanRepository = getRepository(TreatmentFullPlan);

    const treatmentFullPlan = new TreatmentFullPlan();

    treatmentFullPlan.intake_full_id = intake_full_id;
    treatmentFullPlan.treatment_plan_type = treatment_plan_type;
    treatmentFullPlan.tp_implemented_by = tp_implemented_by;
    treatmentFullPlan.tp_type = tp_type;
    treatmentFullPlan.registered_by = registered_by;
    treatmentFullPlan.active_treatment = true;

    const savedTreatmentFullPlan = await treatmentFullPlanRepository.save(treatmentFullPlan);

    return res.customSuccess(200, 'Treatment Plan successfully created.', savedTreatmentFullPlan);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Creating Generic Treatment Plan', null, err);
    return next(customError);
  }
};
