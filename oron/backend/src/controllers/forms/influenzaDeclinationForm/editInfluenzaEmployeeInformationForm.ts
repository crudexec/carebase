import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { InfluenzaEmployeeInformation } from 'orm/entities/InfluenzaVaccineDeclinationForm/personalInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editInfluenzaEmployeeForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { first_name, last_name, department } = req.body;
  const user_id = req.user.id;
  const influenzaEmployeeInformationRepository = getRepository(InfluenzaEmployeeInformation);

  try {
    const personalInformation = await influenzaEmployeeInformationRepository.findOne({ user_id });

    if (personalInformation) {
      first_name = first_name ?? personalInformation.first_name;
      last_name = last_name ?? personalInformation.last_name;
      department = department ?? personalInformation.department;

      const newPersonalInformation = new InfluenzaEmployeeInformation();
      newPersonalInformation.first_name = first_name;
      newPersonalInformation.last_name = last_name;
      newPersonalInformation.department = department;

      await influenzaEmployeeInformationRepository.update(personalInformation.id, newPersonalInformation);

      return res.customSuccess(200, ' Personal Information successfully updated.', newPersonalInformation);
    } else {
      const customError = new CustomError(400, 'General', 'Influenza personal information does not exist', [
        `Influenza personal information does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
