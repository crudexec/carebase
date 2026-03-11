import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { ServiceNeeds } from '../../orm/entities/SpecificNeedsForm/ServiceNeeds';
import { SpecificNeedsFullForm } from '../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { Status } from 'types/genericEnums';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addServiceNeeds = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const specificNeedsRepository = getRepository(SpecificNeedsFullForm);
    const serviceNeedsRepository = getRepository(ServiceNeeds);

    const {
      specific_needs_full_form_id,
      intake_full_id,
      // Services needed
      iiss,
      therapeuticServices,
      respite,
      familyTraining,
      // Transportation services
      transportToSchoolMorning,
      transportFromSchoolToTI,
      transportFromTIToHome,
      transportToCommunity,
      // Transportation requirements
      noSupervisionNeeded,
      supervisionNeeded,
      harnessNeeded,
      // Preferred caregiver
      hasPreferredCaregiver,
      preferredCaregiverName,
      preferredCaregiverPhone,
      preferredCaregiverPhoneCountry,
    } = req.body;

    const specificNeedsFullForm = await specificNeedsRepository.findOne(specific_needs_full_form_id);

    if (!specificNeedsFullForm) {
      const customError = new CustomError(404, 'General', 'Specific needs full form not found', null);
      return next(customError);
    }

    const serviceNeeds = new ServiceNeeds();
    serviceNeeds.intake_full_id = intake_full_id;
    // Services needed
    serviceNeeds.iiss = iiss;
    serviceNeeds.therapeuticServices = therapeuticServices;
    serviceNeeds.respite = respite;
    serviceNeeds.familyTraining = familyTraining;
    // Transportation services
    serviceNeeds.transportToSchoolMorning = transportToSchoolMorning;
    serviceNeeds.transportFromSchoolToTI = transportFromSchoolToTI;
    serviceNeeds.transportFromTIToHome = transportFromTIToHome;
    serviceNeeds.transportToCommunity = transportToCommunity;
    // Transportation requirements
    serviceNeeds.noSupervisionNeeded = noSupervisionNeeded;
    serviceNeeds.supervisionNeeded = supervisionNeeded;
    serviceNeeds.harnessNeeded = harnessNeeded;
    // Preferred caregiver
    serviceNeeds.hasPreferredCaregiver = hasPreferredCaregiver;
    serviceNeeds.preferredCaregiverName = preferredCaregiverName;
    serviceNeeds.preferredCaregiverPhone = preferredCaregiverPhone;
    serviceNeeds.preferredCaregiverPhoneCountry = preferredCaregiverPhoneCountry;

    const newServiceNeeds = await serviceNeedsRepository.save(serviceNeeds);

    if (!newServiceNeeds) {
      const customError = new CustomError(400, 'Raw', 'Error adding service needs', null);
      return next(customError);
    }

    specificNeedsFullForm.service_needs_id = newServiceNeeds.id;
    specificNeedsFullForm.status = Status.IN_PROGRESS;

    await specificNeedsRepository.update(specificNeedsFullForm.id, specificNeedsFullForm);
    return res.customSuccess(200, 'Service needs added successfully.', newServiceNeeds);
  } catch (error) {
    const customError = new CustomError(400, 'Raw', 'Error adding service needs', error);
    return next(customError);
  }
};
