"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addServiceNeeds = void 0;
const typeorm_1 = require("typeorm");
const ServiceNeeds_1 = require("../../orm/entities/SpecificNeedsForm/ServiceNeeds");
const SpecificNeedsFullForm_1 = require("../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const genericEnums_1 = require("types/genericEnums");
const addServiceNeeds = async (req, res, next) => {
    try {
        const specificNeedsRepository = (0, typeorm_1.getRepository)(SpecificNeedsFullForm_1.SpecificNeedsFullForm);
        const serviceNeedsRepository = (0, typeorm_1.getRepository)(ServiceNeeds_1.ServiceNeeds);
        const { specific_needs_full_form_id, intake_full_id, iiss, therapeuticServices, respite, familyTraining, transportToSchoolMorning, transportFromSchoolToTI, transportFromTIToHome, transportToCommunity, noSupervisionNeeded, supervisionNeeded, harnessNeeded, hasPreferredCaregiver, preferredCaregiverName, preferredCaregiverPhone, preferredCaregiverPhoneCountry, } = req.body;
        const specificNeedsFullForm = await specificNeedsRepository.findOne(specific_needs_full_form_id);
        if (!specificNeedsFullForm) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Specific needs full form not found', null);
            return next(customError);
        }
        const serviceNeeds = new ServiceNeeds_1.ServiceNeeds();
        serviceNeeds.intake_full_id = intake_full_id;
        serviceNeeds.iiss = iiss;
        serviceNeeds.therapeuticServices = therapeuticServices;
        serviceNeeds.respite = respite;
        serviceNeeds.familyTraining = familyTraining;
        serviceNeeds.transportToSchoolMorning = transportToSchoolMorning;
        serviceNeeds.transportFromSchoolToTI = transportFromSchoolToTI;
        serviceNeeds.transportFromTIToHome = transportFromTIToHome;
        serviceNeeds.transportToCommunity = transportToCommunity;
        serviceNeeds.noSupervisionNeeded = noSupervisionNeeded;
        serviceNeeds.supervisionNeeded = supervisionNeeded;
        serviceNeeds.harnessNeeded = harnessNeeded;
        serviceNeeds.hasPreferredCaregiver = hasPreferredCaregiver;
        serviceNeeds.preferredCaregiverName = preferredCaregiverName;
        serviceNeeds.preferredCaregiverPhone = preferredCaregiverPhone;
        serviceNeeds.preferredCaregiverPhoneCountry = preferredCaregiverPhoneCountry;
        const newServiceNeeds = await serviceNeedsRepository.save(serviceNeeds);
        if (!newServiceNeeds) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Error adding service needs', null);
            return next(customError);
        }
        specificNeedsFullForm.service_needs_id = newServiceNeeds.id;
        specificNeedsFullForm.status = genericEnums_1.Status.IN_PROGRESS;
        await specificNeedsRepository.update(specificNeedsFullForm.id, specificNeedsFullForm);
        return res.customSuccess(200, 'Service needs added successfully.', newServiceNeeds);
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error adding service needs', error);
        return next(customError);
    }
};
exports.addServiceNeeds = addServiceNeeds;
//# sourceMappingURL=addServiceNeeds.js.map