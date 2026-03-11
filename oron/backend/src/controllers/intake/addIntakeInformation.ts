import { Request, Response, NextFunction } from 'express';
import { getConnection, getRepository } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { IntakeInformation } from 'orm/entities/IntakeForm/intakeInformation';
import { PeoplePresentInformation } from 'orm/entities/IntakeForm/peoplePresent';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addIntakeInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { who_conducted_intake, date_of_intake, people_present, referral_information_id, intake_full_id } = req.body;
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  const intakeInformationRepository = getRepository(IntakeInformation);
  const peoplePresentInformationRepository = connection.getRepository(PeoplePresentInformation);
  const intakeFullFormRepository = connection.getRepository(IntakeFullForm);
  const user_id = req.user.id;

  try {
    const newIntakeInformation = new IntakeInformation();
    newIntakeInformation.who_conducted_intake = who_conducted_intake;
    newIntakeInformation.date_of_intake = date_of_intake;
    newIntakeInformation.registered_by = user_id;
    const savedIntakeInformation = await intakeInformationRepository.save(newIntakeInformation);
    if (people_present.length > 0) {
      people_present.forEach(async (person: any) => {
        const newPeoplePresentInformation = new PeoplePresentInformation();
        newPeoplePresentInformation.first_name = person.first_name;
        newPeoplePresentInformation.relationship_to_participant = person.relationship_to_participant;
        newPeoplePresentInformation.registered_by = user_id;
        newPeoplePresentInformation.intake_information_id = savedIntakeInformation.id;
        await peoplePresentInformationRepository.save(newPeoplePresentInformation);
      });

      const savedPeoplePresentInformation = await peoplePresentInformationRepository.find({
        where: { intake_information_id: savedIntakeInformation.id },
      });

      const alreadyExistingIntakeFullForm = await intakeFullFormRepository.findOne({
        where: { id: intake_full_id, deleted_at: null },
      });

      const newIntakeFullForm = new IntakeFullForm();

      if (alreadyExistingIntakeFullForm) {
        newIntakeFullForm.intake_information_id = savedIntakeInformation.id;
        await intakeFullFormRepository.update(alreadyExistingIntakeFullForm.id, newIntakeFullForm);
      }

      await queryRunner.commitTransaction();

      return res.customSuccess(200, 'Intake Information successfully created.', {
        savedIntakeInformation,
        savedPeoplePresentInformation,
      });
    } else {
      const customError = new CustomError(400, 'General', 'People Present Information is required', [
        `People Present Information is required`,
      ]);
      await queryRunner.rollbackTransaction();
      return next(customError);
    }
  } catch (err) {
    await queryRunner.rollbackTransaction();
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  } finally {
    await queryRunner.release();
  }
};
