import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { SafetyAndSurvivalSkills } from 'orm/entities/VisitLog/stepTwo/safetyAndSurvivalSkills';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addSafetySurvivalSkills = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const {
      cross_the_street,
      awareness_of_strangers,
      fire_emergency_awareness,
      unlock_door_when_trapped_in_a_room,
      other,
      specify_other,
      visit_full_form_id,
    } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;

    const safetyAndSurvivalSkillsRepository = getRepository(SafetyAndSurvivalSkills);
    const visitFullFormRepository = getRepository(VisitFullForm);

    const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
      return next(customError);
    }

    const safetyAndSurvivalSkills = new SafetyAndSurvivalSkills();

    safetyAndSurvivalSkills.cross_the_street = cross_the_street;
    safetyAndSurvivalSkills.awareness_of_strangers = awareness_of_strangers;
    safetyAndSurvivalSkills.fire_emergency_awareness = fire_emergency_awareness;
    safetyAndSurvivalSkills.unlock_door_when_trapped_in_a_room = unlock_door_when_trapped_in_a_room;
    safetyAndSurvivalSkills.other = other;
    safetyAndSurvivalSkills.specify_other = specify_other;

    safetyAndSurvivalSkills.account_id = account_id;
    safetyAndSurvivalSkills.status = Status.IN_PROGRESS;
    safetyAndSurvivalSkills.registered_by = registered_by;
    safetyAndSurvivalSkills.visit_full_form_id = visit_full_form_id;

    const savedSafetyAndSurvivalSkills = await safetyAndSurvivalSkillsRepository.save(safetyAndSurvivalSkills);

    if (savedSafetyAndSurvivalSkills) {
      await visitFullFormRepository.update(visit_full_form_id, {
        safety_and_survival_skills_id: savedSafetyAndSurvivalSkills.id,
      });
    }
    return res.customSuccess(200, 'Safety and Survival Skills successfully added.', savedSafetyAndSurvivalSkills);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Safety and Survival Skills', null, err);
    return next(customError);
  }
};
