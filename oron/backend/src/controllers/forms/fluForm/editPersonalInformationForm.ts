import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { FluEmployeeInformation } from 'orm/entities/FluForm/personalInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editFluPersonalInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const user_id = req.user.id;
  const fluEmployeeInformationRepository = getRepository(FluEmployeeInformation);

  let { first_name, last_name, job_title } = req.body;

  try {
    const personalInformation = await fluEmployeeInformationRepository.findOne({ user_id });

    if (personalInformation) {
      first_name = first_name ?? personalInformation.first_name;
      last_name = last_name ?? personalInformation.last_name;
      job_title = job_title ?? personalInformation.job_title;

      const newPersonalInformation = new FluEmployeeInformation();

      newPersonalInformation.first_name = first_name;
      newPersonalInformation.last_name = last_name;
      newPersonalInformation.job_title = job_title;

      await fluEmployeeInformationRepository.update(personalInformation.id, newPersonalInformation);

      return res.customSuccess(200, 'Flu personal information successfully updated.', newPersonalInformation);
    } else {
      const customError = new CustomError(400, 'General', 'Flu personal information does not exist', [
        `Flu personal information does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
