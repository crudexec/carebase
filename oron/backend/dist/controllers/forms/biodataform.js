"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillBioData = void 0;
const typeorm_1 = require("typeorm");
const userBioData_1 = require("orm/entities/userBioData");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fillBioData = async (req, res, next) => {
    const { first_name, last_name, email, phone, address, city, state, zip_code, middle_name, other_last_name, social_security_number, apartment_number, npi, lba, } = req.body;
    const userBioDataRepository = (0, typeorm_1.getRepository)(userBioData_1.UserBioData);
    const user_id = req.user.id;
    try {
        const ssnExists = await userBioDataRepository.findOne({ where: { social_security_number } });
        const emailExists = await userBioDataRepository.findOne({ where: { email } });
        if (social_security_number.length !== 9) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Social Security Number must be 9 digits', [
                `SSN must be 9 digits`,
            ]);
            return next(customError);
        }
        if (ssnExists) {
            const customError = new CustomError_1.CustomError(400, 'General', 'This Social Security Number already exists', [
                `SSN already exists`,
            ]);
            return next(customError);
        }
        if (emailExists) {
            const customError = new CustomError_1.CustomError(400, 'General', 'This Email already exists', [`Email already exists`]);
            return next(customError);
        }
        const userBioData = await userBioDataRepository.findOne({ where: { user_id } });
        if (userBioData) {
            const customError = new CustomError_1.CustomError(400, 'General', 'User BioData already exists', [`Bio Data already exists`]);
            return next(customError);
        }
        const newUserBioData = new userBioData_1.UserBioData();
        newUserBioData.email = email;
        newUserBioData.first_name = first_name;
        newUserBioData.last_name = last_name;
        newUserBioData.middle_name = middle_name;
        newUserBioData.other_last_name = other_last_name;
        newUserBioData.phone = phone;
        newUserBioData.address = address;
        newUserBioData.city = city;
        newUserBioData.state = state;
        newUserBioData.zip_code = zip_code;
        newUserBioData.user_id = user_id;
        newUserBioData.social_security_number = social_security_number;
        newUserBioData.apartment_number = apartment_number;
        newUserBioData.npi = npi;
        newUserBioData.lba = lba;
        newUserBioData.status = genericEnums_1.Status.AWAITING_APPROVAL;
        const savedBioData = await userBioDataRepository.save(newUserBioData);
        return res.customSuccess(200, 'User BioData successfully created.', savedBioData);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fillBioData = fillBioData;
//# sourceMappingURL=biodataform.js.map