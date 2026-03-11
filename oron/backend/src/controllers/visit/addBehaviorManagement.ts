import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { BehaviorManagement } from 'orm/entities/VisitLog/stepOne/behaviorManagement';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addBehaviorManagement = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const { behaviorManagementArray } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;
    const behaviorManagementRepository = getRepository(BehaviorManagement);
    const visitFullFormRepository = getRepository(VisitFullForm);
    const behaviorManagementDump = [];
    let behaviorManagementUnit;
    const behaviorManagement = new BehaviorManagement();

    const visitExists = await visitFullFormRepository.findOne({
      where: { id: behaviorManagementArray[0]?.visit_full_form_id, deleted_at: null },
    });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit Form not found`, ['Visit Form not found.']);
      return next(customError);
    }

    for (let i = 0; i < behaviorManagementArray.length; i++) {
      const behaviorManagementData = behaviorManagementArray[i];
      const {
        behavior_type,
        behavior_description,
        what_time_did_behavior_occur,
        antecedent,
        consequence,
        setting,
        how_many_times_did_behavior_occur,
        for_how_long_did_behavior_occur,
        severity,
        other_crisis_intervention,
        other_specific_description,
        visit_full_form_id,
      } = behaviorManagementData;
      behaviorManagement.behavior_type = behavior_type;
      behaviorManagement.behavior_description = behavior_description;
      behaviorManagement.what_time_did_behavior_occur = what_time_did_behavior_occur;
      behaviorManagement.antecedent = antecedent;
      behaviorManagement.consequence = consequence;
      behaviorManagement.setting = setting;
      behaviorManagement.how_many_times_did_behavior_occur = how_many_times_did_behavior_occur;
      behaviorManagement.for_how_long_did_behavior_occur = for_how_long_did_behavior_occur;
      behaviorManagement.severity = severity;
      behaviorManagement.other_crisis_intervention = other_crisis_intervention;
      behaviorManagement.other_specific_description = other_specific_description;
      behaviorManagement.account_id = account_id;
      behaviorManagement.status = Status.IN_PROGRESS;
      behaviorManagement.registered_by = registered_by;
      behaviorManagement.visit_full_form_id = visit_full_form_id;
      behaviorManagementUnit = await behaviorManagementRepository.save(behaviorManagement);

      if (behaviorManagementUnit) {
        if (!visitExists.behavior_management_ids) {
          visitExists.behavior_management_ids = [];
          visitExists.behavior_management_ids.push(behaviorManagementUnit.id);
          await visitFullFormRepository.update(visitExists.id, {
            behavior_management_ids: visitExists.behavior_management_ids,
          });
        } else {
          visitExists.behavior_management_ids.push(behaviorManagementUnit.id);
          await visitFullFormRepository.update(visitExists.id, {
            behavior_management_ids: visitExists.behavior_management_ids,
          });
        }
      }

      behaviorManagementDump.push(behaviorManagementUnit);
    }

    return res.customSuccess(200, 'Behavior Management successfully added.', behaviorManagementDump);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Behavior Management', null, err);
    return next(customError);
  }
};
