import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Events } from 'orm/entities/Events/events';
import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { PeoplePresentInformation } from 'orm/entities/IntakeForm/peoplePresent';
import { WaiverServices } from 'orm/entities/IntakeForm/waiverService';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveEmployeesFullIntake = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const intakeFullFormRepository = getRepository(IntakeFullForm);
  const waiverServiceRepository = getRepository(WaiverServices);
  const peoplePresentInformationRepository = getRepository(PeoplePresentInformation);
  const eventRepository = getRepository(Events);
  const user_id = req.user.id;
  const intakeDump = [];
  const uniqueIntakes = new Set();
  try {
    const employeeEvents = await eventRepository.find({
      where: { employee_or_staff_id: user_id, deleted_at: null },
    });

    if (!employeeEvents) {
      return res.customSuccess(200, 'No events found for this employee.', []);
    }
    if (employeeEvents.length > 0) {
      for (let i = 0; i < employeeEvents.length; i++) {
        const intakeFullForm = await intakeFullFormRepository.findOne({
          where: { id: employeeEvents[i].client_intake_id, deleted_at: null },
          relations: [
            'admissionInformation',
            'clientInformation',
            'fatherContactInformation',
            'motherContactInformation',
            'schoolContactInformation',
            'moreAboutInformation',
            'medicalInformation',
            'referralInformation',
            'intakeInformation',
            'emergencyContactInformation',
            'serviceCoordinatorInformation',
          ],
        });
        if (uniqueIntakes.has(intakeFullForm?.id)) continue;
        let tempIntake = {};
        tempIntake = { ...intakeFullForm };
        if (intakeFullForm?.admissionInformation) {
          const admission_information_id = intakeFullForm?.admissionInformation?.id;
          const waiverService = await waiverServiceRepository.find({
            where: { admission_information_id, deleted_at: null },
          });
          tempIntake['waiverService'] = waiverService;
        }
        if (intakeFullForm?.intakeInformation) {
          const intake_information_id = intakeFullForm?.intakeInformation?.id;
          const peoplePresent = await peoplePresentInformationRepository.find({
            where: { intake_information_id, deleted_at: null },
          });
          tempIntake['peoplePresent'] = peoplePresent;
        }
        intakeDump.push(tempIntake);
        uniqueIntakes.add(intakeFullForm?.id);
      }
    }
    return res.customSuccess(200, 'Intake Full Form successfully retrieved for employee', intakeDump);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
