"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPersonalInformationForm = void 0;
const typeorm_1 = require("typeorm");
const personalInformation_1 = require("orm/entities/EmployeeDemographicForm/personalInformation");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editPersonalInformationForm = async (req, res, next) => {
    let { first_name, last_name, date_of_birth, home_phone_number, street_address, gender, race_or_ethinicity, phone, city, state, zip_code, social_security_number, } = req.body;
    const personalInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.EmployeePersonalInformation);
    const user_id = req.user.id;
    try {
        const personalInformation = await personalInformationRepository.findOne({ where: { user_id } });
        if (personalInformation) {
            const newpersonalInformation = new personalInformation_1.EmployeePersonalInformation();
            first_name = first_name ?? personalInformation.first_name;
            last_name = last_name ?? personalInformation.last_name;
            date_of_birth = date_of_birth ?? personalInformation.date_of_birth;
            home_phone_number = home_phone_number ?? personalInformation.home_phone_number;
            phone = phone ?? personalInformation.phone;
            city = city ?? personalInformation.city;
            race_or_ethinicity = race_or_ethinicity ?? personalInformation.race_or_ethinicity;
            gender = gender ?? personalInformation.gender;
            state = state ?? personalInformation.state;
            street_address = street_address ?? personalInformation.street_address;
            zip_code = zip_code ?? personalInformation.zip_code;
            social_security_number = social_security_number ?? personalInformation.social_security_number;
            if (social_security_number !== personalInformation.social_security_number) {
                const ssnExists = await personalInformationRepository.findOne({ where: { social_security_number } });
                if (ssnExists) {
                    const customError = new CustomError_1.CustomError(400, 'General', 'This Social Security Number already exists', [
                        `SSN already exists`,
                    ]);
                    return next(customError);
                }
            }
            newpersonalInformation.first_name = first_name;
            newpersonalInformation.last_name = last_name;
            newpersonalInformation.date_of_birth = date_of_birth;
            newpersonalInformation.home_phone_number = home_phone_number;
            newpersonalInformation.phone = phone;
            newpersonalInformation.city = city;
            newpersonalInformation.race_or_ethinicity = race_or_ethinicity;
            newpersonalInformation.gender = gender;
            newpersonalInformation.state = state;
            newpersonalInformation.street_address = street_address;
            newpersonalInformation.zip_code = zip_code;
            newpersonalInformation.social_security_number = social_security_number;
            newpersonalInformation.status = genericEnums_1.Status.AWAITING_APPROVAL;
            await personalInformationRepository.update(personalInformation.id, newpersonalInformation);
            return res.customSuccess(200, 'User demographic personal information successfully updated.', newpersonalInformation);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editPersonalInformationForm = editPersonalInformationForm;
//# sourceMappingURL=editPersonalInformation.js.map