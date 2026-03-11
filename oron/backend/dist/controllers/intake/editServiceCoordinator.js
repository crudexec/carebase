"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editServiceCoordinatorInformation = void 0;
const typeorm_1 = require("typeorm");
const serviceCoordinatorInformation_1 = require("orm/entities/IntakeForm/serviceCoordinatorInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editServiceCoordinatorInformation = async (req, res, next) => {
    let { full_name, email, phone, country, fax_number } = req.body;
    try {
        const serviceCoordinatorInformationRepository = (0, typeorm_1.getRepository)(serviceCoordinatorInformation_1.ServiceCoordinatorInformation);
        const user_id = req.user.id;
        const form_id = req.params.form_id;
        const serviceCoordinatorInformation = await serviceCoordinatorInformationRepository.findOne({
            where: { id: form_id },
        });
        if (!serviceCoordinatorInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Service Coordinator Information already exists', [
                `Service Coordinator Information already exists`,
            ]);
            return next(customError);
        }
        full_name = full_name ?? serviceCoordinatorInformation.full_name;
        email = email ?? serviceCoordinatorInformation.email;
        phone = phone ?? serviceCoordinatorInformation.phone;
        country = country ?? serviceCoordinatorInformation.country;
        fax_number = fax_number ?? serviceCoordinatorInformation.fax_number;
        const updatedServiceCoordinatorInformation = new serviceCoordinatorInformation_1.ServiceCoordinatorInformation();
        updatedServiceCoordinatorInformation.full_name = full_name;
        updatedServiceCoordinatorInformation.email = email;
        updatedServiceCoordinatorInformation.phone = phone;
        updatedServiceCoordinatorInformation.country = country;
        updatedServiceCoordinatorInformation.fax_number = fax_number;
        await serviceCoordinatorInformationRepository.update({ id: serviceCoordinatorInformation.id }, updatedServiceCoordinatorInformation);
        return res.customSuccess(200, 'Service Coordinator Information successfully updated.', updatedServiceCoordinatorInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating Service Coordinator', null, err);
        return next(customError);
    }
};
exports.editServiceCoordinatorInformation = editServiceCoordinatorInformation;
//# sourceMappingURL=editServiceCoordinator.js.map