import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MMRAttestationForm } from 'orm/entities/MMRVaccineForm/mmrAttestationForm';
import { MMRFullForm } from 'orm/entities/MMRVaccineForm/mmrFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addMMRAttestationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const {
    do_not_think_will_contract_mumps,
    do_not_think_serious_disease,
    side_effects_from_vaccine,
    will_stay_home_if_infected,
    other,
  } = req.body;
  const mmrAttestationFormRepository = getRepository(MMRAttestationForm);
  const mmrFullFormRepository = getRepository(MMRFullForm);
  const user_id = req.user.id;

  try {
    const attestationForm = await mmrAttestationFormRepository.findOne({ where: { user_id } });
    if (attestationForm) {
      const customError = new CustomError(400, 'General', 'Attestation form already exists', [
        `Attestation form already exists`,
      ]);
      return next(customError);
    }
    const newAttestationForm = new MMRAttestationForm();
    newAttestationForm.do_not_think_will_contract_mumps = do_not_think_will_contract_mumps;
    newAttestationForm.do_not_think_serious_disease = do_not_think_serious_disease;
    newAttestationForm.side_effects_from_vaccine = side_effects_from_vaccine;
    newAttestationForm.will_stay_home_if_infected = will_stay_home_if_infected;
    newAttestationForm.other = other;
    newAttestationForm.user_id = user_id;

    const savedAttestationForm = await mmrAttestationFormRepository.save(newAttestationForm);

    if (savedAttestationForm) {
      const fullForm = await mmrFullFormRepository.findOne({ where: { user_id } });
      if (fullForm) {
        fullForm.attestation_id = savedAttestationForm.id;
        fullForm.status = Status.IN_PROGRESS;
        await mmrFullFormRepository.save(fullForm);
      } else {
        const newFullForm = new MMRFullForm();
        newFullForm.user_id = user_id;
        newFullForm.attestation_id = savedAttestationForm.id;
        newFullForm.status = Status.IN_PROGRESS;
        await mmrFullFormRepository.save(newFullForm);
      }
    }
    return res.customSuccess(200, 'Attestation form successfully created.', savedAttestationForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
