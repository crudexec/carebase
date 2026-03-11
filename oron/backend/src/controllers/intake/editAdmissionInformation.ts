import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { AdmissionInformation } from 'orm/entities/IntakeForm/admissionInformation';
import { WaiverServices } from 'orm/entities/IntakeForm/waiverService';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editAdmissionInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const form_id = req.params.form_id;
    const admissionInformationRepository = getRepository(AdmissionInformation);
    const waiverServicesRepository = getRepository(WaiverServices);
    const fullAdmissionInformation = {};
    let { poc_authorization_number, poc_start_date, poc_end_date, waiver_services } = req.body;

    const admissionInformation = await admissionInformationRepository.findOne({ where: { id: form_id } });
    if (!admissionInformation) {
      const customError = new CustomError(400, 'Raw', 'Admission Information does not exist', null, null);
      return next(customError);
    }

    poc_authorization_number = poc_authorization_number ?? admissionInformation.poc_authorization_number;
    poc_start_date = poc_start_date ?? admissionInformation.poc_start_date;
    poc_end_date = poc_end_date ?? admissionInformation.poc_end_date;

    const updatedAdmissionInformation = new AdmissionInformation();

    updatedAdmissionInformation.poc_authorization_number = poc_authorization_number;
    updatedAdmissionInformation.poc_start_date = poc_start_date;
    updatedAdmissionInformation.poc_end_date = poc_end_date;

    await admissionInformationRepository.update(admissionInformation.id, updatedAdmissionInformation);

    if (waiver_services.length > 0) {
      for (const waiver_service of waiver_services) {
        const waiverExists = await waiverServicesRepository.findOne({
          where: {
            select_waiver_system: waiver_service.select_waiver_system,
            admission_information_id: form_id,
            deleted_at: null,
          },
        });

        if (waiverExists) {
          let {
            select_waiver_system,
            service_end_date,
            service_start_date,
            amount_per_day_week_month,
            amount_per_year,
          } = waiverExists;
          select_waiver_system = select_waiver_system ?? waiverExists.select_waiver_system;
          service_end_date = service_end_date ?? waiverExists.service_end_date;
          service_start_date = service_start_date ?? waiverExists.service_start_date;
          amount_per_day_week_month = amount_per_day_week_month ?? waiverExists.amount_per_day_week_month;
          amount_per_year = amount_per_year ?? waiverExists.amount_per_year;

          const updatedWaiverService = new WaiverServices();

          updatedWaiverService.select_waiver_system = select_waiver_system;
          updatedWaiverService.service_end_date = service_end_date;
          updatedWaiverService.service_start_date = service_start_date;
          updatedWaiverService.amount_per_day_week_month = amount_per_day_week_month;
          updatedWaiverService.amount_per_year = amount_per_year;
          await waiverServicesRepository.update({ id: waiverExists.id }, updatedWaiverService);
        } else {
          const {
            select_waiver_system,
            service_end_date,
            service_start_date,
            amount_per_day_week_month,
            amount_per_year,
          } = waiver_service;

          const newWaiverService = new WaiverServices();
          newWaiverService.select_waiver_system = select_waiver_system;
          newWaiverService.service_end_date = service_end_date;
          newWaiverService.service_start_date = service_start_date;
          newWaiverService.amount_per_day_week_month = amount_per_day_week_month;
          newWaiverService.amount_per_year = amount_per_year;
          newWaiverService.registered_by = req.user.id;
          newWaiverService.admission_information_id = admissionInformation.id;
          await waiverServicesRepository.save(newWaiverService);
        }
      }
    }

    const admissionInformationData = await admissionInformationRepository.findOne({ where: { id: form_id } });
    const waiverServicesData = await waiverServicesRepository.find({
      where: { admission_information_id: admissionInformationData.id, deleted_at: null },
    });

    fullAdmissionInformation['admission_information'] = admissionInformationData;
    fullAdmissionInformation['waiver_services'] = waiverServicesData;

    return res.customSuccess(200, 'Admission Information successfully created.', fullAdmissionInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
