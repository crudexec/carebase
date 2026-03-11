import { Request, Response, NextFunction } from 'express';
import { getRepository, getConnection } from 'typeorm';

import { AdmissionInformation } from 'orm/entities/IntakeForm/admissionInformation';
import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { WaiverServices } from 'orm/entities/IntakeForm/waiverService';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addAdmissionInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  try {
    await queryRunner.startTransaction();
    const user_id = req.user.id;
    const admissionInformationRepository = connection.getRepository(AdmissionInformation);
    const waiverServicesRepository = connection.getRepository(WaiverServices);
    const intakeFullFormRepository = connection.getRepository(IntakeFullForm);
    const fullAdmissionInformation = {};
    const { poc_authorization_number, poc_start_date, poc_end_date, medical_information_id, intake_full_id } = req.body;

    const waiverServiceData = req.body.waiver_services;

    const newAdmissionInformation = new AdmissionInformation();
    newAdmissionInformation.registered_by = user_id;
    newAdmissionInformation.poc_authorization_number = poc_authorization_number;
    newAdmissionInformation.poc_start_date = poc_start_date;
    newAdmissionInformation.poc_end_date = poc_end_date;

    const savedAdmissionInformation = await admissionInformationRepository.save(newAdmissionInformation);

    if (!savedAdmissionInformation) {
      const customError = new CustomError(400, 'Raw', 'Error saving basic admission information', null, null);
      return next(customError);
    }

    if (waiverServiceData.length > 0) {
      waiverServiceData.forEach(async (waiverService: any) => {
        const newWaiverService = new WaiverServices();
        newWaiverService.select_waiver_system = waiverService.select_waiver_system;
        newWaiverService.service_end_date = waiverService.service_end_date;
        newWaiverService.service_start_date = waiverService.service_start_date;
        newWaiverService.amount_per_day_week_month = waiverService.amount_per_day_week_month;
        newWaiverService.amount_per_year = waiverService.amount_per_year;
        newWaiverService.admission_information_id = savedAdmissionInformation.id;
        newWaiverService.registered_by = user_id;
        await waiverServicesRepository.save(newWaiverService);
      });

      const newIntakeFullForm = new IntakeFullForm();

      const alreadyExistIntakeFullForm = await intakeFullFormRepository.findOne({
        where: { id: intake_full_id, deleted_at: null },
      });
      if (alreadyExistIntakeFullForm) {
        newIntakeFullForm.admission_information_id = savedAdmissionInformation.id;
        await intakeFullFormRepository.update(alreadyExistIntakeFullForm.id, newIntakeFullForm);
      }
      await queryRunner.commitTransaction();
    }
    // else {
    //   const customError = new CustomError(400, 'Raw', 'Waiver Services Information is required', null, null);
    //   await queryRunner.rollbackTransaction();
    //   return next(customError);
    // }
    const admissionInformationData = await admissionInformationRepository.findOne({
      where: { id: savedAdmissionInformation.id },
    });
    const waiverServicesData = await waiverServicesRepository.find({
      where: { admission_information_id: admissionInformationData.id },
    });
    fullAdmissionInformation['admission_information'] = admissionInformationData;
    fullAdmissionInformation['waiver_services'] = waiverServicesData;

    return res.customSuccess(200, 'Admission Information successfully created.', fullAdmissionInformation);
  } catch (err) {
    await queryRunner.rollbackTransaction();
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  } finally {
    await queryRunner.release();
  }
};
