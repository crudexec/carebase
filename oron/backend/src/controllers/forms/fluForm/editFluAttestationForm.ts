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

export const editFluAttestationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const user_id = req.user.id;
  const fluAttestationFormRepository = getRepository(FluAttestationForm);
  const fluFullFormRepository = getRepository(FluFullForm);

  let {
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
    const vaccineAttestationForm = await fluAttestationFormRepository.findOne({ user_id });

    if (vaccineAttestationForm) {
      date_received_flu_vaccine = date_received_flu_vaccine ?? vaccineAttestationForm.date_received_flu_vaccine;
      vaccination_site = vaccination_site ?? vaccineAttestationForm.vaccination_site;
      other = other ?? vaccineAttestationForm.other;

      const newVaccineAttestationForm = new FluAttestationForm();
      newVaccineAttestationForm.have_received_flu_vaccine = have_received_flu_vaccine;
      newVaccineAttestationForm.date_received_flu_vaccine = date_received_flu_vaccine;
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

      await fluAttestationFormRepository.update(vaccineAttestationForm.id, newVaccineAttestationForm);

      await fluFullFormRepository.update({ attestation_id: vaccineAttestationForm.id }, { status: Status.IN_PROGRESS });

      return res.customSuccess(200, 'Flu attestation form successfully updated.', newVaccineAttestationForm);
    } else {
      const customError = new CustomError(400, 'General', 'Flu attestation form does not exist', [
        `Flu attestation form does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
