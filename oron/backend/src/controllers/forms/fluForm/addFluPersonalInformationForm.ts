import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { FluFullForm } from 'orm/entities/FluForm/fluFullForm';
import { FluEmployeeInformation } from 'orm/entities/FluForm/personalInformation';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addFluPersonalInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const fluEmployeeInformationRepository = getRepository(FluEmployeeInformation);
    const fluFullFormRepository = getRepository(FluFullForm);

    const { first_name, last_name, job_title, date_of_filling_form } = req.body;
    const personalInformation = await fluEmployeeInformationRepository.findOne({ where: { user_id } });

    if (personalInformation) {
      const customError = new CustomError(400, 'General', 'Flu personal information already exists', [
        `Flu personal information already exists`,
      ]);
      return next(customError);
    }

    const newPersonalInformation = new FluEmployeeInformation();

    newPersonalInformation.first_name = first_name;
    newPersonalInformation.last_name = last_name;
    newPersonalInformation.job_title = job_title;
    newPersonalInformation.date_of_filling_form = date_of_filling_form;
    newPersonalInformation.user_id = user_id;

    const savedPersonalInformation = await fluEmployeeInformationRepository.save(newPersonalInformation);

    if (savedPersonalInformation) {
      const fluFullForm = await fluFullFormRepository.findOne({ where: { user_id } });
      if (fluFullForm) {
        fluFullForm.personal_information_id = savedPersonalInformation.id;
        fluFullForm.status = Status.IN_PROGRESS;
        await fluFullFormRepository.update(fluFullForm.id, fluFullForm);
      } else {
        const newFluFullForm = new FluFullForm();
        newFluFullForm.personal_information_id = savedPersonalInformation.id;
        newFluFullForm.user_id = user_id;
        newFluFullForm.status = Status.IN_PROGRESS;
        await fluFullFormRepository.save(newFluFullForm);
      }
    }

    return res.customSuccess(200, 'Flu personal information successfully created.', savedPersonalInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
