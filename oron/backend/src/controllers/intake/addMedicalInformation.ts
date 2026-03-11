import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { MedicalInformation } from 'orm/entities/IntakeForm/medicalInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addMedicalInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const {
      diagnosis,
      medical_history_or_allergies,
      medications,
      other_comments,
      more_about_information_id,
      intake_full_id,
    } = req.body;
    const user_id = req.user.id;

    const medicalInformationRepository = getRepository(MedicalInformation);
    const intakeFullFormRepository = getRepository(IntakeFullForm);

    const newMedicalInformation = new MedicalInformation();
    newMedicalInformation.diagnosis = diagnosis;
    newMedicalInformation.medical_history_or_allergies = medical_history_or_allergies;
    newMedicalInformation.medications = medications;
    newMedicalInformation.other_comments = other_comments;
    newMedicalInformation.registered_by = user_id;

    const savedMedicalInformation = await medicalInformationRepository.save(newMedicalInformation);

    if (savedMedicalInformation) {
      const newIntakeFullForm = new IntakeFullForm();

      const alreadyExistingIntakeFullForm = await intakeFullFormRepository.findOne({
        where: { id: intake_full_id, deleted_at: null },
      });

      if (alreadyExistingIntakeFullForm) {
        newIntakeFullForm.medical_information_id = savedMedicalInformation.id;
        await intakeFullFormRepository.update(alreadyExistingIntakeFullForm.id, newIntakeFullForm);
      }
    }

    return res.customSuccess(200, 'Medical Information successfully created.', savedMedicalInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error', null, err);
    return next(customError);
  }
};
