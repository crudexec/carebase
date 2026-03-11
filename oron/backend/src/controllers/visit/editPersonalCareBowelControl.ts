import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PersonalCareAndBladderControl } from 'orm/entities/VisitLog/stepTwo/personalCareAndControl';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editPersonalCareBowelControl = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let {
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
      personal_care_and_bladder_control_id,
    } = req.body;

    const personalCareAndBladderControlRepository = getRepository(PersonalCareAndBladderControl);

    const formExists = await personalCareAndBladderControlRepository.findOne({
      where: { id: personal_care_and_bladder_control_id, deleted_at: null },
    });
    if (!formExists) {
      const customError = new CustomError(404, 'General', `Personal Care and Bladder Control not found`, [
        'Personal Care and Bladder Control not found.',
      ]);
      return next(customError);
    }

    client_name_used_bathroom_without_assistance =
      client_name_used_bathroom_without_assistance ?? formExists.client_name_used_bathroom_without_assistance;
    assisted_client_with_changing_diapers =
      assisted_client_with_changing_diapers ?? formExists.assisted_client_with_changing_diapers;
    assisted_client_with_toileting = assisted_client_with_toileting ?? formExists.assisted_client_with_toileting;
    other_bowel = other_bowel ?? formExists.other_bowel;
    other_specify_bowel = other_specify_bowel ?? formExists.other_specify_bowel;
    supported_client_with_bathing = supported_client_with_bathing ?? formExists.supported_client_with_bathing;
    supported_client_with_brushing_teeth =
      supported_client_with_brushing_teeth ?? formExists.supported_client_with_brushing_teeth;
    supported_client_with_shampooing = supported_client_with_shampooing ?? formExists.supported_client_with_shampooing;
    supported_client_with_toweling = supported_client_with_toweling ?? formExists.supported_client_with_toweling;
    supported_client_with_showering = supported_client_with_showering ?? formExists.supported_client_with_showering;
    supported_client_with_menstrual_care =
      supported_client_with_menstrual_care ?? formExists.supported_client_with_menstrual_care;
    other_personal_hygiene = other_personal_hygiene ?? formExists.other_personal_hygiene;
    other_specify_personal_hygiene = other_specify_personal_hygiene ?? formExists.other_specify_personal_hygiene;

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

    await personalCareAndBladderControlRepository.update(
      personal_care_and_bladder_control_id,
      personalCareAndBladderControl,
    );

    return res.customSuccess(
      200,
      'Personal Care and Bladder Control successfully updated.',
      personalCareAndBladderControl,
    );
  } catch (err) {
    const customError = new CustomError(
      400,
      'Raw',
      'Network Error Updating Personal Care and Bladder Control',
      null,
      err,
    );
    return next(customError);
  }
};
