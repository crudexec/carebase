import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { ServiceNeeds } from '../../orm/entities/SpecificNeedsForm/ServiceNeeds';
import { SpecificNeedsFullForm } from '../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editServiceNeeds = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const specificNeedsRepository = getRepository(SpecificNeedsFullForm);
    const serviceNeedsRepository = getRepository(ServiceNeeds);

    let {
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
      service_needs_id,
    } = req.body;

    // Check if service needs exists
    const existingServiceNeeds = await serviceNeedsRepository.findOne(service_needs_id);
    if (!existingServiceNeeds) {
      const customError = new CustomError(404, 'General', 'Service needs not found', null);
      return next(customError);
    }

    // Check if specific needs form exists
    const specificNeedsFullForm = await specificNeedsRepository.findOne(specific_needs_full_form_id);
    if (!specificNeedsFullForm) {
      const customError = new CustomError(404, 'General', 'Specific needs full form not found', null);
      return next(customError);
    }

    iiss = iiss ?? existingServiceNeeds.iiss;
    therapeuticServices = therapeuticServices ?? existingServiceNeeds.therapeuticServices;
    respite = respite ?? existingServiceNeeds.respite;
    familyTraining = familyTraining ?? existingServiceNeeds.familyTraining;
    transportToSchoolMorning = transportToSchoolMorning ?? existingServiceNeeds.transportToSchoolMorning;
    transportFromSchoolToTI = transportFromSchoolToTI ?? existingServiceNeeds.transportFromSchoolToTI;
    transportFromTIToHome = transportFromTIToHome ?? existingServiceNeeds.transportFromTIToHome;
    transportToCommunity = transportToCommunity ?? existingServiceNeeds.transportToCommunity;
    noSupervisionNeeded = noSupervisionNeeded ?? existingServiceNeeds.noSupervisionNeeded;
    supervisionNeeded = supervisionNeeded ?? existingServiceNeeds.supervisionNeeded;
    harnessNeeded = harnessNeeded ?? existingServiceNeeds.harnessNeeded;
    hasPreferredCaregiver = hasPreferredCaregiver ?? existingServiceNeeds.hasPreferredCaregiver;
    preferredCaregiverName = preferredCaregiverName ?? existingServiceNeeds.preferredCaregiverName;
    preferredCaregiverPhone = preferredCaregiverPhone ?? existingServiceNeeds.preferredCaregiverPhone;
    preferredCaregiverPhoneCountry =
      preferredCaregiverPhoneCountry ?? existingServiceNeeds.preferredCaregiverPhoneCountry;

    existingServiceNeeds.iiss = iiss;
    existingServiceNeeds.therapeuticServices = therapeuticServices;
    existingServiceNeeds.respite = respite;
    existingServiceNeeds.familyTraining = familyTraining;
    existingServiceNeeds.transportToSchoolMorning = transportToSchoolMorning;
    existingServiceNeeds.transportFromSchoolToTI = transportFromSchoolToTI;
    existingServiceNeeds.transportFromTIToHome = transportFromTIToHome;
    existingServiceNeeds.transportToCommunity = transportToCommunity;
    existingServiceNeeds.noSupervisionNeeded = noSupervisionNeeded;
    existingServiceNeeds.supervisionNeeded = supervisionNeeded;
    existingServiceNeeds.harnessNeeded = harnessNeeded;
    existingServiceNeeds.hasPreferredCaregiver = hasPreferredCaregiver;
    existingServiceNeeds.preferredCaregiverName = preferredCaregiverName;
    existingServiceNeeds.preferredCaregiverPhone = preferredCaregiverPhone;
    existingServiceNeeds.preferredCaregiverPhoneCountry = preferredCaregiverPhoneCountry;

    const updatedServiceNeeds = await serviceNeedsRepository.update(existingServiceNeeds.id, existingServiceNeeds);

    if (!updatedServiceNeeds) {
      const customError = new CustomError(400, 'Raw', 'Error updating service needs', null);
      return next(customError);
    }

    return res.customSuccess(200, 'Service needs updated successfully.', existingServiceNeeds);
  } catch (error) {
    const customError = new CustomError(400, 'Raw', 'Error updating service needs', error);
    return next(customError);
  }
};
