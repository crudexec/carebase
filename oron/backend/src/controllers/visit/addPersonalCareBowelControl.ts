import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PersonalCareAndBladderControl } from 'orm/entities/VisitLog/stepTwo/personalCareAndControl';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addPersonalCareBowelControl = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const {
      client_name_used_bathroom_without_assistance,
      assisted_client_with_changing_diapers,
      assisted_client_with_toileting,
      other_bowel,
      other_specify_bowel,
      supported_client_with_bathing,
      supported_client_with_brushing_teeth,
      supported_client_with_shampooing,
      supported_client_with_toweling,
      supported_client_with_showering,
      supported_client_with_menstrual_care,
      other_personal_hygiene,
      other_specify_personal_hygiene,
      visit_full_form_id,
    } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;

    const personalCareAndBladderControlRepository = getRepository(PersonalCareAndBladderControl);
    const visitFullFormRepository = getRepository(VisitFullForm);

    const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
      return next(customError);
    }

    const personalCareAndBladderControl = new PersonalCareAndBladderControl();

    personalCareAndBladderControl.client_name_used_bathroom_without_assistance =
      client_name_used_bathroom_without_assistance;
    personalCareAndBladderControl.assisted_client_with_changing_diapers = assisted_client_with_changing_diapers;
    personalCareAndBladderControl.assisted_client_with_toileting = assisted_client_with_toileting;
    personalCareAndBladderControl.other_bowel = other_bowel;
    personalCareAndBladderControl.other_specify_bowel = other_specify_bowel;
    personalCareAndBladderControl.supported_client_with_bathing = supported_client_with_bathing;
    personalCareAndBladderControl.supported_client_with_brushing_teeth = supported_client_with_brushing_teeth;
    personalCareAndBladderControl.supported_client_with_shampooing = supported_client_with_shampooing;
    personalCareAndBladderControl.supported_client_with_toweling = supported_client_with_toweling;
    personalCareAndBladderControl.supported_client_with_showering = supported_client_with_showering;
    personalCareAndBladderControl.supported_client_with_menstrual_care = supported_client_with_menstrual_care;
    personalCareAndBladderControl.other_personal_hygiene = other_personal_hygiene;
    personalCareAndBladderControl.other_specify_personal_hygiene = other_specify_personal_hygiene;
    personalCareAndBladderControl.account_id = account_id;
    personalCareAndBladderControl.status = Status.IN_PROGRESS;
    personalCareAndBladderControl.registered_by = registered_by;
    personalCareAndBladderControl.visit_full_form_id = visit_full_form_id;

    const savedPersonalCareAndBladderControl = await personalCareAndBladderControlRepository.save(
      personalCareAndBladderControl,
    );

    if (savedPersonalCareAndBladderControl) {
      await visitFullFormRepository.update(visit_full_form_id, {
        personal_care_and_bladder_control_id: savedPersonalCareAndBladderControl.id,
      });
    }
    return res.customSuccess(
      200,
      'Personal Care and Bladder Control successfully added.',
      savedPersonalCareAndBladderControl,
    );
  } catch (err) {
    const customError = new CustomError(
      400,
      'Raw',
      'Network Error Adding Personal Care and Bladder Control',
      null,
      err,
    );
    return next(customError);
  }
};
