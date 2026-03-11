"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFatherInformation = void 0;
const typeorm_1 = require("typeorm");
const fatherContactInformation_1 = require("orm/entities/IntakeForm/fatherContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addFatherInformation = async (req, res, next) => {
    const { first_name, last_name, relationship, email, street_number_and_house_address, country, state, city, zip_code, apartment_number, phone, home_phone_number, work_phone_number, } = req.body;
    const fatherContactInformationRepository = (0, typeorm_1.getRepository)(fatherContactInformation_1.FatherContactInformation);
    const user_id = req.user.id;
    try {
        const newFatherContactInformation = new fatherContactInformation_1.FatherContactInformation();
        newFatherContactInformation.first_name = first_name;
        newFatherContactInformation.last_name = last_name;
        newFatherContactInformation.relationship = relationship;
        newFatherContactInformation.email = email;
        newFatherContactInformation.street_number_and_house_address = street_number_and_house_address;
        newFatherContactInformation.country = country;
        newFatherContactInformation.state = state;
        newFatherContactInformation.city = city;
        newFatherContactInformation.zip_code = zip_code;
        newFatherContactInformation.apartment_number = apartment_number;
        newFatherContactInformation.phone = phone;
        newFatherContactInformation.home_phone_number = home_phone_number;
        newFatherContactInformation.work_phone_number = work_phone_number;
        newFatherContactInformation.registered_by = user_id;
        const savedFatherInformation = await fatherContactInformationRepository.save(newFatherContactInformation);
        return res.customSuccess(200, 'Father Contact Information successfully created.', savedFatherInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addFatherInformation = addFatherInformation;
//# sourceMappingURL=addFatherInformation.js.map