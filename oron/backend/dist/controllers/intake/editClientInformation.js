"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editClientInformation = void 0;
const typeorm_1 = require("typeorm");
const clientInformation_1 = require("orm/entities/IntakeForm/clientInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editClientInformation = async (req, res, next) => {
    let { first_name, last_name, date_of_birth, state, sex, race_or_ethinicity, country, social_security_number, medicaid_number, city, county, zip_code, address_or_street, apartment_number, } = req.body;
    const clientInformationRepository = (0, typeorm_1.getRepository)(clientInformation_1.ClientInformation);
    const form_id = req.params.form_id;
    try {
        const clientInformation = await clientInformationRepository.findOne({ where: { id: form_id } });
        if (clientInformation) {
            const newClientInformation = new clientInformation_1.ClientInformation();
            first_name = first_name ?? clientInformation.first_name;
            last_name = last_name ?? clientInformation.last_name;
            date_of_birth = date_of_birth ?? clientInformation.date_of_birth;
            state = state ?? clientInformation.state;
            country = country ?? clientInformation.country;
            race_or_ethinicity = race_or_ethinicity ?? clientInformation.race_or_ethinicity;
            social_security_number = social_security_number ?? clientInformation.social_security_number;
            medicaid_number = medicaid_number ?? clientInformation.medicaid_number;
            sex = sex ?? clientInformation.sex;
            city = city ?? clientInformation.city;
            county = county ?? clientInformation.county;
            zip_code = zip_code ?? clientInformation.zip_code;
            address_or_street = address_or_street ?? clientInformation.address_or_street;
            apartment_number = apartment_number ?? clientInformation.apartment_number;
            newClientInformation.first_name = first_name;
            newClientInformation.last_name = last_name;
            newClientInformation.date_of_birth = date_of_birth;
            newClientInformation.state = state;
            newClientInformation.country = country;
            newClientInformation.sex = sex;
            newClientInformation.race_or_ethinicity = race_or_ethinicity;
            newClientInformation.social_security_number = social_security_number;
            newClientInformation.medicaid_number = medicaid_number;
            newClientInformation.city = city;
            newClientInformation.county = county;
            newClientInformation.zip_code = zip_code;
            newClientInformation.address_or_street = address_or_street;
            newClientInformation.apartment_number = apartment_number;
            await clientInformationRepository.update({ id: clientInformation.id }, newClientInformation);
            return res.customSuccess(200, 'Client Information successfully created.', newClientInformation);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Client Information not found', [
                `Client Information does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editClientInformation = editClientInformation;
//# sourceMappingURL=editClientInformation.js.map