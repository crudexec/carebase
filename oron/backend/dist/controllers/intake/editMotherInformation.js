"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editMotherInformation = void 0;
const typeorm_1 = require("typeorm");
const motherContactInformation_1 = require("orm/entities/IntakeForm/motherContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editMotherInformation = async (req, res, next) => {
    let { first_name, last_name, relationship, email, street_number_and_house_address, country, state, city, zip_code, apartment_number, phone, home_phone_number, work_phone_number, } = req.body;
    const motherInformationRepository = (0, typeorm_1.getRepository)(motherContactInformation_1.MotherContactInformation);
    const user_id = req.user.id;
    const form_id = req.params.form_id;
    try {
        const motherInformation = await motherInformationRepository.findOne({ where: { id: form_id } });
        if (!motherInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Mother Information does not exist', [
                `Mother Information does not exist`,
            ]);
            return next(customError);
        }
        first_name = first_name ?? motherInformation.first_name;
        last_name = last_name ?? motherInformation.last_name;
        relationship = relationship ?? motherInformation.relationship;
        email = email ?? motherInformation.email;
        street_number_and_house_address =
            street_number_and_house_address ?? motherInformation.street_number_and_house_address;
        country = country ?? motherInformation.country;
        state = state ?? motherInformation.state;
        city = city ?? motherInformation.city;
        zip_code = zip_code ?? motherInformation.zip_code;
        apartment_number = apartment_number ?? motherInformation.apartment_number;
        phone = phone ?? motherInformation.phone;
        home_phone_number = home_phone_number ?? motherInformation.home_phone_number;
        work_phone_number = work_phone_number ?? motherInformation.work_phone_number;
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
        await motherInformationRepository.update({ id: motherInformation.id }, newMotherInformation);
        return res.customSuccess(200, 'Mother Information successfully updated.', newMotherInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error', null, err);
        return next(customError);
    }
};
exports.editMotherInformation = editMotherInformation;
//# sourceMappingURL=editMotherInformation.js.map