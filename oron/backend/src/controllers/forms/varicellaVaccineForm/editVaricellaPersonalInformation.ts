import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VaricellaEmployeeInformation } from 'orm/entities/VaricellaVaccineForm/personalInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editVaricellaPersonalInformationForm = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  let { first_name, last_name, job_title } = req.body;
  const user_id = req.user.id;
  const VaricellaEmployeeInformationRepository = getRepository(VaricellaEmployeeInformation);

  try {
    const newVaricellaEmployeeInformation = new VaricellaEmployeeInformation();

    const varicellaEmployeeInformation = await VaricellaEmployeeInformationRepository.findOne({ where: { user_id } });

    if (varicellaEmployeeInformation) {
      first_name = first_name ?? varicellaEmployeeInformation.first_name;
      last_name = last_name ?? varicellaEmployeeInformation.last_name;
      job_title = job_title ?? varicellaEmployeeInformation.job_title;

      newVaricellaEmployeeInformation.first_name = first_name;
      newVaricellaEmployeeInformation.last_name = last_name;
      newVaricellaEmployeeInformation.job_title = job_title;

      await VaricellaEmployeeInformationRepository.update(
        varicellaEmployeeInformation.id,
        newVaricellaEmployeeInformation,
      );

      return res.customSuccess(200, ' Personal Information successfully updated.', newVaricellaEmployeeInformation);
    } else {
      const customError = new CustomError(400, 'General', 'Personal information does not exist', [
        `Personal information does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
