import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { SafetyAndSurvivalSkills } from 'orm/entities/VisitLog/stepTwo/safetyAndSurvivalSkills';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editSafetySurvivalSkills = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let {
      cross_the_street,
      awareness_of_strangers,
      fire_emergency_awareness,
      unlock_door_when_trapped_in_a_room,
      other,
      specify_other,
      safety_and_survival_skills_id,
    } = req.body;

    const safetyAndSurvivalSkillsRepository = getRepository(SafetyAndSurvivalSkills);

    const safetyAndSurvivalSkillsExists = await safetyAndSurvivalSkillsRepository.findOne({
      where: { id: safety_and_survival_skills_id, deleted_at: null },
    });

    if (!safetyAndSurvivalSkillsExists) {
      const customError = new CustomError(404, 'General', `Safety and Survival Skills not found`, [
        'Safety and Survival Skills not found.',
      ]);
      return next(customError);
    }

    cross_the_street = cross_the_street ?? safetyAndSurvivalSkillsExists.cross_the_street;
    awareness_of_strangers = awareness_of_strangers ?? safetyAndSurvivalSkillsExists.awareness_of_strangers;
    fire_emergency_awareness = fire_emergency_awareness ?? safetyAndSurvivalSkillsExists.fire_emergency_awareness;
    unlock_door_when_trapped_in_a_room =
      unlock_door_when_trapped_in_a_room ?? safetyAndSurvivalSkillsExists.unlock_door_when_trapped_in_a_room;
    other = other ?? safetyAndSurvivalSkillsExists.other;
    specify_other = specify_other ?? safetyAndSurvivalSkillsExists.specify_other;

    const safetyAndSurvivalSkills = new SafetyAndSurvivalSkills();

    safetyAndSurvivalSkills.cross_the_street = cross_the_street;
    safetyAndSurvivalSkills.awareness_of_strangers = awareness_of_strangers;
    safetyAndSurvivalSkills.fire_emergency_awareness = fire_emergency_awareness;
    safetyAndSurvivalSkills.unlock_door_when_trapped_in_a_room = unlock_door_when_trapped_in_a_room;
    safetyAndSurvivalSkills.other = other;
    safetyAndSurvivalSkills.specify_other = specify_other;

    await safetyAndSurvivalSkillsRepository.update(safety_and_survival_skills_id, safetyAndSurvivalSkills);

    return res.customSuccess(200, 'Safety and Survival Skills successfully updated.', safetyAndSurvivalSkills);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Safety and Survival Skills', null, err);
    return next(customError);
  }
};
