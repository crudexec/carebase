"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addServiceCoordinatorInformation = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const serviceCoordinatorInformation_1 = require("orm/entities/IntakeForm/serviceCoordinatorInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addServiceCoordinatorInformation = async (req, res, next) => {
    const { full_name, email, phone, country, fax_number, emergency_contact_information_id, intake_full_id } = req.body;
    try {
        const serviceCoordinatorInformationRepository = (0, typeorm_1.getRepository)(serviceCoordinatorInformation_1.ServiceCoordinatorInformation);
        const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const user_id = req.user.id;
        const newServiceCoordinatorInformation = new serviceCoordinatorInformation_1.ServiceCoordinatorInformation();
        newServiceCoordinatorInformation.full_name = full_name;
        newServiceCoordinatorInformation.email = email;
        newServiceCoordinatorInformation.phone = phone;
        newServiceCoordinatorInformation.country = country;
        newServiceCoordinatorInformation.fax_number = fax_number;
        newServiceCoordinatorInformation.registered_by = user_id;
        const savedServiceCoordinatorInformation = await serviceCoordinatorInformationRepository.save(newServiceCoordinatorInformation);
        if (savedServiceCoordinatorInformation) {
            const newIntakeFullForm = new intakeFullForm_1.IntakeFullForm();
            const alreadyExistingIntakeFullForm = await intakeFullFormRepository.findOne({
                where: { id: intake_full_id, deleted_at: null },
            });
            if (alreadyExistingIntakeFullForm) {
                newIntakeFullForm.service_coordinator_information_id = savedServiceCoordinatorInformation.id;
                await intakeFullFormRepository.update(alreadyExistingIntakeFullForm.id, newIntakeFullForm);
            }
        }
        return res.customSuccess(200, 'Service Coordinator Information successfully created.', savedServiceCoordinatorInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Service Coordinator', null, err);
        return next(customError);
    }
};
exports.addServiceCoordinatorInformation = addServiceCoordinatorInformation;
//# sourceMappingURL=addServiceCoordinator.js.map