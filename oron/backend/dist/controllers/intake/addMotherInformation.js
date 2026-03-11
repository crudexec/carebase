"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMotherInformation = void 0;
const typeorm_1 = require("typeorm");
const motherContactInformation_1 = require("orm/entities/IntakeForm/motherContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addMotherInformation = async (req, res, next) => {
    const { first_name, last_name, relationship, email, street_number_and_house_address, country, state, city, zip_code, apartment_number, phone, home_phone_number, work_phone_number, } = req.body;
    const motherInformationRepository = (0, typeorm_1.getRepository)(motherContactInformation_1.MotherContactInformation);
    const user_id = req.user.id;
    try {
        const newMotherInformation = new motherContactInformation_1.MotherContactInformation();
        newMotherInformation.first_name = first_name;
        newMotherInformation.last_name = last_name;
        newMotherInformation.relationship = relationship;
        newMotherInformation.email = email;
        newMotherInformation.street_number_and_house_address = street_number_and_house_address;
        newMotherInformation.country = country;
        newMotherInformation.state = state;
        newMotherInformation.city = city;
        newMotherInformation.zip_code = zip_code;
        newMotherInformation.apartment_number = apartment_number;
        newMotherInformation.phone = phone;
        newMotherInformation.home_phone_number = home_phone_number;
        newMotherInformation.work_phone_number = work_phone_number;
        newMotherInformation.registered_by = user_id;
        const savedMotherInformation = await motherInformationRepository.save(newMotherInformation);
        return res.customSuccess(200, 'Mother Information successfully created.', savedMotherInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addMotherInformation = addMotherInformation;
//# sourceMappingURL=addMotherInformation.js.map