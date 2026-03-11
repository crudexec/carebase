"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editServiceNeeds = void 0;
const typeorm_1 = require("typeorm");
const ServiceNeeds_1 = require("../../orm/entities/SpecificNeedsForm/ServiceNeeds");
const SpecificNeedsFullForm_1 = require("../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editServiceNeeds = async (req, res, next) => {
    try {
        const specificNeedsRepository = (0, typeorm_1.getRepository)(SpecificNeedsFullForm_1.SpecificNeedsFullForm);
        const serviceNeedsRepository = (0, typeorm_1.getRepository)(ServiceNeeds_1.ServiceNeeds);
        let { specific_needs_full_form_id, intake_full_id, iiss, therapeuticServices, respite, familyTraining, transportToSchoolMorning, transportFromSchoolToTI, transportFromTIToHome, transportToCommunity, noSupervisionNeeded, supervisionNeeded, harnessNeeded, hasPreferredCaregiver, preferredCaregiverName, preferredCaregiverPhone, preferredCaregiverPhoneCountry, service_needs_id, } = req.body;
        const existingServiceNeeds = await serviceNeedsRepository.findOne(service_needs_id);
        if (!existingServiceNeeds) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Service needs not found', null);
            return next(customError);
        }
        const specificNeedsFullForm = await specificNeedsRepository.findOne(specific_needs_full_form_id);
        if (!specificNeedsFullForm) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Specific needs full form not found', null);
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
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Error updating service needs', null);
            return next(customError);
        }
        return res.customSuccess(200, 'Service needs updated successfully.', existingServiceNeeds);
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error updating service needs', error);
        return next(customError);
    }
};
exports.editServiceNeeds = editServiceNeeds;
//# sourceMappingURL=editServiceNeeds.js.map