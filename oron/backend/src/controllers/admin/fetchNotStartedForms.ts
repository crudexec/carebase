import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CJISFullForm } from 'orm/entities/CJISForm/cjisFullForm';
import { EmployeePersonalInformation } from 'orm/entities/EmployeeDemographicForm/personalInformation';
import { FluFullForm } from 'orm/entities/FluForm/fluFullForm';
import { HepatitisBFullForm } from 'orm/entities/HepatitisBForm/HepatitisFullForm';
import { I9Form } from 'orm/entities/i9Form/i9form';
import { MMRFullForm } from 'orm/entities/MMRVaccineForm/mmrFullForm';
import { PneumococcalVaccinationFullForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm';
import { ReferenceForm } from 'orm/entities/ReferenceForm/reference';
import { TuberculosisFullForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm';
import { Role } from 'orm/entities/types';
import { User } from 'orm/entities/User';
import { UserBioData } from 'orm/entities/userBioData';
import { VaricellaFullForm } from 'orm/entities/VaricellaVaccineForm/varicellaFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fetchUserNotFilledForms = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const userRepository = getRepository(User);
  const user_id = req.params.id;
  const userBioDataRepository = getRepository(UserBioData);
  const employeeDemographicRepository = getRepository(EmployeePersonalInformation);
  const fluFullFormRepository = getRepository(FluFullForm);

  const hepatitisBFullFormRepository = getRepository(HepatitisBFullForm);
  const i9FormRepository = getRepository(I9Form);
  const mmrFullFormRepository = getRepository(MMRFullForm);

  const pneumococcalVaccinationFullFormRepository = getRepository(PneumococcalVaccinationFullForm);
  const tuberculosisFullFormRepository = getRepository(TuberculosisFullForm);

  const varicellaFullFormRepository = getRepository(VaricellaFullForm);

  const referenceFormRepository = getRepository(ReferenceForm);
  const cjisFullFormRepository = getRepository(CJISFullForm);

  try {
    const user = await userRepository.findOne({ where: { id: user_id, role: Role.STANDARD } });

    const userBioData = await userBioDataRepository.findOne({
      where: { user_id: user_id },
    });
    const employeeDemographicInformation = await employeeDemographicRepository.findOne({
      where: { user_id },
    });
    const fluFullForm = await fluFullFormRepository.findOne({ where: { user_id } });
    const hepatitisBFullForm = await hepatitisBFullFormRepository.findOne({
      where: { user_id },
    });
    const i9Form = await i9FormRepository.findOne({ where: { owner: user_id } });

    const mmrFullForm = await mmrFullFormRepository.findOne({ where: { user_id } });

    const pneumococcalVaccinationFullForm = await pneumococcalVaccinationFullFormRepository.findOne({
      where: { user_id },
    });
    const tuberculosisFullForm = await tuberculosisFullFormRepository.findOne({
      where: { owner: user_id },
    });
    const varicellaFullForm = await varicellaFullFormRepository.findOne({
      where: { user_id },
    });

    const referenceForm = await referenceFormRepository.findOne({ where: { user_id } });

    const cjisFullForm = await cjisFullFormRepository.findOne({ where: { user_id } });

    const formsData = {};

    if (!userBioData) {
      formsData['userBioDataForm'] = userBioData;
    }
    if (!employeeDemographicInformation) {
      formsData['employeeDemographicForm'] = {
        employeeDemographicInformation,
      };
    }

    if (!fluFullForm) {
      formsData['fluForm'] = {
        fluFullForm,
      };
    }

    if (!hepatitisBFullForm) {
      formsData['hepatitisBForm'] = {
        hepatitisBFullForm,
      };
    }

    if (!i9Form) {
      formsData['i9Form'] = {
        i9Form,
      };
    }

    if (!mmrFullForm) {
      formsData['mmrForm'] = {
        mmrFullForm,
      };
    }

    if (!pneumococcalVaccinationFullForm) {
      formsData['pneumococcalForm'] = {
        pneumococcalVaccinationFullForm,
      };
    }

    if (!tuberculosisFullForm) {
      formsData['tuberculosisForm'] = {
        tuberculosisFullForm,
      };
    }

    if (!varicellaFullForm) {
      formsData['varicellaForm'] = {
        varicellaFullForm,
      };
    }

    if (!referenceForm) {
      formsData['referenceForm'] = referenceForm;
    }

    if (!cjisFullForm) {
      formsData['cjisForm'] = {
        cjisFullForm,
      };
    }

    return res.customSuccess(200, 'User and form data successfully retrieved.', {
      user,
      formsData,
      total: Object.keys(formsData).length,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
