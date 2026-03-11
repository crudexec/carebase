"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFatherInformation = void 0;
const typeorm_1 = require("typeorm");
const fatherContactInformation_1 = require("orm/entities/IntakeForm/fatherContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editFatherInformation = async (req, res, next) => {
    let { first_name, last_name, relationship, email, street_number_and_house_address, country, state, city, zip_code, apartment_number, phone, home_phone_number, work_phone_number, } = req.body;
    const fatherContactInformationRepository = (0, typeorm_1.getRepository)(fatherContactInformation_1.FatherContactInformation);
    const user_id = req.user.id;
    const form_id = req.params.form_id;
    try {
        const motherInformation = await fatherContactInformationRepository.findOne({ where: { id: form_id } });
        if (!motherInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Father Contact Information does not exist', [
                `Father Contact Information does not exist`,
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
        await fatherContactInformationRepository.update({ id: motherInformation.id }, newFatherContactInformation);
        return res.customSuccess(200, 'Father Contact Information successfully updated.', newFatherContactInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editFatherInformation = editFatherInformation;
//# sourceMappingURL=editFatherInformation.js.map