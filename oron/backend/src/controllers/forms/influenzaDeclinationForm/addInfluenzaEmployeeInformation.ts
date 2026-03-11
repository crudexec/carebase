import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { InfluenzaVaccinationDeclinationFullForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm';
import { InfluenzaEmployeeInformation } from 'orm/entities/InfluenzaVaccineDeclinationForm/personalInformation';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addInfluenzaEmployeeForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { first_name, last_name, department, date_of_filling_form } = req.body;
  const user_id = req.user.id;
  const influenzaEmployeeInformationRepository = getRepository(InfluenzaEmployeeInformation);
  const influenzaVaccinationDeclinationFullFormRepository = getRepository(InfluenzaVaccinationDeclinationFullForm);

  try {
    const personalInformation = await influenzaEmployeeInformationRepository.findOne({ user_id });

    if (personalInformation) {
      const customError = new CustomError(400, 'General', 'Influenza personal information already exists', [
        `Influenza personal information already exists`,
      ]);
      return next(customError);
    }

    const newPersonalInformation = new InfluenzaEmployeeInformation();

    newPersonalInformation.first_name = first_name;
    newPersonalInformation.last_name = last_name;
    newPersonalInformation.department = department;
    newPersonalInformation.date_of_filling_form = date_of_filling_form;
    newPersonalInformation.user_id = user_id;

    const savedPersonalInformation = await influenzaEmployeeInformationRepository.save(newPersonalInformation);

    if (savedPersonalInformation) {
      const influenzaVaccinationDeclinationFullForm = await influenzaVaccinationDeclinationFullFormRepository.findOne({
        user_id,
      });
      if (influenzaVaccinationDeclinationFullForm) {
        influenzaVaccinationDeclinationFullForm.personal_information_id = savedPersonalInformation.id;
        influenzaVaccinationDeclinationFullForm.status = Status.IN_PROGRESS;
        await influenzaVaccinationDeclinationFullFormRepository.update(
          influenzaVaccinationDeclinationFullForm.id,
          influenzaVaccinationDeclinationFullForm,
        );
      } else {
        const newInfluenzaVaccinationDeclinationFullForm = new InfluenzaVaccinationDeclinationFullForm();
        newInfluenzaVaccinationDeclinationFullForm.personal_information_id = savedPersonalInformation.id;
        newInfluenzaVaccinationDeclinationFullForm.user_id = user_id;
        newInfluenzaVaccinationDeclinationFullForm.status = Status.IN_PROGRESS;
        await influenzaVaccinationDeclinationFullFormRepository.save(newInfluenzaVaccinationDeclinationFullForm);
      }
    }

    return res.customSuccess(200, 'Influenza personal information successfully created.', savedPersonalInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
