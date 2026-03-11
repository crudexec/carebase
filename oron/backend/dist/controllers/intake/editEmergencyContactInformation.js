"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editEmergencyContactInformation = void 0;
const typeorm_1 = require("typeorm");
const emergencyContactInformation_1 = require("orm/entities/IntakeForm/emergencyContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editEmergencyContactInformation = async (req, res, next) => {
    let { first_name, last_name, relationship, email, street_number_and_house_address, country, state, city, zip_code, apartment_number, phone, home_phone_number, work_phone_number, } = req.body;
    try {
        const emergencyContactInformationRepository = (0, typeorm_1.getRepository)(emergencyContactInformation_1.IntakeEmergencyContactInformation);
        const user_id = req.user.id;
        const form_id = req.params.form_id;
        const emergencyContactInformation = await emergencyContactInformationRepository.findOne({ where: { id: form_id } });
        if (!emergencyContactInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Emergency Contact Information does not exist', [
                `Emergency Contact Information does not exist`,
            ]);
            return next(customError);
        }
        first_name = first_name ?? emergencyContactInformation.first_name;
        last_name = last_name ?? emergencyContactInformation.last_name;
        relationship = relationship ?? emergencyContactInformation.relationship;
        email = email ?? emergencyContactInformation.email;
        street_number_and_house_address =
            street_number_and_house_address ?? emergencyContactInformation.street_number_and_house_address;
        country = country ?? emergencyContactInformation.country;
        state = state ?? emergencyContactInformation.state;
        city = city ?? emergencyContactInformation.city;
        zip_code = zip_code ?? emergencyContactInformation.zip_code;
        apartment_number = apartment_number ?? emergencyContactInformation.apartment_number;
        phone = phone ?? emergencyContactInformation.phone;
        home_phone_number = home_phone_number ?? emergencyContactInformation.home_phone_number;
        work_phone_number = work_phone_number ?? emergencyContactInformation.work_phone_number;
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
        await emergencyContactInformationRepository.update({ id: emergencyContactInformation.id }, newEmergencyContactInformation);
        const updatedEmergencyContactInformation = await emergencyContactInformationRepository.findOne({
            where: { id: form_id },
        });
        return res.customSuccess(200, 'Emergency Contact Information successfully updated.', updatedEmergencyContactInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editEmergencyContactInformation = editEmergencyContactInformation;
//# sourceMappingURL=editEmergencyContactInformation.js.map