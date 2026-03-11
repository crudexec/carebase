"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editEmergencyContactInformation = void 0;
const typeorm_1 = require("typeorm");
const emergencyDemographicForm_1 = require("orm/entities/EmployeeDemographicForm/emergencyDemographicForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editEmergencyContactInformation = async (req, res, next) => {
    let { first_name, last_name, relationship_to_employee, street_address, phone, city, zip_code, state } = req.body;
    const emergencyContactInformationRepository = (0, typeorm_1.getRepository)(emergencyDemographicForm_1.EmergencyContactInformation);
    const user_id = req.user.id;
    try {
        const emergencyInformation = await emergencyContactInformationRepository.findOne({ where: { user_id } });
        if (emergencyInformation) {
            const newEmergencyInformation = new emergencyDemographicForm_1.EmergencyContactInformation();
            first_name = first_name ?? emergencyInformation.first_name;
            last_name = last_name ?? emergencyInformation.last_name;
            relationship_to_employee = relationship_to_employee ?? emergencyInformation.relationship_to_employee;
            street_address = street_address ?? emergencyInformation.street_address;
            phone = phone ?? emergencyInformation.phone;
            city = city ?? emergencyInformation.city;
            zip_code = zip_code ?? emergencyInformation.zip_code;
            state = state ?? emergencyInformation.state;
            newEmergencyInformation.first_name = first_name;
            newEmergencyInformation.last_name = last_name;
            newEmergencyInformation.relationship_to_employee = relationship_to_employee;
            newEmergencyInformation.phone = phone;
            newEmergencyInformation.city = city;
            newEmergencyInformation.street_address = street_address;
            newEmergencyInformation.state = state;
            newEmergencyInformation.zip_code = zip_code;
            await emergencyContactInformationRepository.update(emergencyInformation.id, newEmergencyInformation);
            return res.customSuccess(200, 'Emergency contact information successfully updated.', newEmergencyInformation);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editEmergencyContactInformation = editEmergencyContactInformation;
//# sourceMappingURL=editEmergencyContact.js.map