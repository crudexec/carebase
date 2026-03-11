"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmergencyContactInformation = void 0;
const typeorm_1 = require("typeorm");
const emergencyContactInformation_1 = require("orm/entities/IntakeForm/emergencyContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addEmergencyContactInformation = async (req, res, next) => {
    const { first_name, last_name, relationship, email, street_number_and_house_address, country, state, city, zip_code, apartment_number, phone, home_phone_number, work_phone_number, } = req.body;
    try {
        const emergencyContactInformationRepository = (0, typeorm_1.getRepository)(emergencyContactInformation_1.IntakeEmergencyContactInformation);
        const user_id = req.user.id;
        const newEmergencyContactInformation = new emergencyContactInformation_1.IntakeEmergencyContactInformation();
        newEmergencyContactInformation.first_name = first_name;
        newEmergencyContactInformation.last_name = last_name;
        newEmergencyContactInformation.relationship = relationship;
        newEmergencyContactInformation.email = email;
        newEmergencyContactInformation.street_number_and_house_address = street_number_and_house_address;
        newEmergencyContactInformation.country = country;
        newEmergencyContactInformation.state = state;
        newEmergencyContactInformation.city = city;
        newEmergencyContactInformation.zip_code = zip_code;
        newEmergencyContactInformation.apartment_number = apartment_number;
        newEmergencyContactInformation.phone = phone;
        newEmergencyContactInformation.home_phone_number = home_phone_number;
        newEmergencyContactInformation.work_phone_number = work_phone_number;
        newEmergencyContactInformation.registered_by = user_id;
        const savedEmergencyContactInformation = await emergencyContactInformationRepository.save(newEmergencyContactInformation);
        return res.customSuccess(200, 'Emergency Contact Information successfully created.', savedEmergencyContactInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addEmergencyContactInformation = addEmergencyContactInformation;
//# sourceMappingURL=addEmergencyContactInformation.js.map