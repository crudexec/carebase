import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { FluFullForm } from 'orm/entities/FluForm/fluFullForm';
import { FluAttestationForm } from 'orm/entities/FluForm/vaccineAttestationForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addFluAttestationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const user_id = req.user.id;
  const fluAttestationFormRepository = getRepository(FluAttestationForm);
  const fluFullFormRepository = getRepository(FluFullForm);

  const {
    have_received_flu_vaccine,
    date_received_flu_vaccine,
    vaccination_site,
    received_flu_vaccine_elsewhere,
    medical_contraindication_to_receiving_vaccine,
    personal_or_religious_beliefs_preventing_vaccination,
    allergic_to_vaccine_components,
    concerns_about_vaccine_safety,
    other,
    declined_flu_vaccine,
  } = req.body;

  try {
    const vaccineAttestationForm = await fluAttestationFormRepository.findOne({ where: { user_id } });

    if (vaccineAttestationForm) {
      const customError = new CustomError(400, 'General', 'Flu attestation form already exists', [
        `Flu attestation form already exists`,
      ]);
      return next(customError);
    }

    const newVaccineAttestationForm = new FluAttestationForm();
    newVaccineAttestationForm.have_received_flu_vaccine = have_received_flu_vaccine;
    newVaccineAttestationForm.date_received_flu_vaccine = new Date(date_received_flu_vaccine);
    newVaccineAttestationForm.vaccination_site = vaccination_site;
    newVaccineAttestationForm.received_flu_vaccine_elsewhere = received_flu_vaccine_elsewhere;
    newVaccineAttestationForm.medical_contraindication_to_receiving_vaccine =
      medical_contraindication_to_receiving_vaccine;
    newVaccineAttestationForm.personal_or_religious_beliefs_preventing_vaccination =
      personal_or_religious_beliefs_preventing_vaccination;
    newVaccineAttestationForm.allergic_to_vaccine_components = allergic_to_vaccine_components;
    newVaccineAttestationForm.concerns_about_vaccine_safety = concerns_about_vaccine_safety;
    newVaccineAttestationForm.other = other;
    newVaccineAttestationForm.declined_flu_vaccine = declined_flu_vaccine;
    newVaccineAttestationForm.user_id = user_id;

    const savedVaccineAttestationForm = await fluAttestationFormRepository.save(newVaccineAttestationForm);

    if (savedVaccineAttestationForm) {
      const fluFullForm = await fluFullFormRepository.findOne({ where: { user_id } });

      if (fluFullForm) {
        fluFullForm.attestation_id = savedVaccineAttestationForm.id;
        fluFullForm.status = Status.IN_PROGRESS;

        await fluFullFormRepository.update(fluFullForm.id, fluFullForm);
      } else {
        const newFluFullForm = new FluFullForm();

        newFluFullForm.attestation_id = savedVaccineAttestationForm.id;
        newFluFullForm.user_id = user_id;
        newFluFullForm.status = Status.IN_PROGRESS;

        await fluFullFormRepository.save(newFluFullForm);
      }
    }
    return res.customSuccess(200, 'Flu attestation form successfully created.', savedVaccineAttestationForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
