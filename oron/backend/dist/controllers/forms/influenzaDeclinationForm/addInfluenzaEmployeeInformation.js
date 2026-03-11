"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addInfluenzaEmployeeForm = void 0;
const typeorm_1 = require("typeorm");
const influenzaDeclinationFullForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm");
const personalInformation_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/personalInformation");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addInfluenzaEmployeeForm = async (req, res, next) => {
    const { first_name, last_name, department, date_of_filling_form } = req.body;
    const user_id = req.user.id;
    const influenzaEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.InfluenzaEmployeeInformation);
    const influenzaVaccinationDeclinationFullFormRepository = (0, typeorm_1.getRepository)(influenzaDeclinationFullForm_1.InfluenzaVaccinationDeclinationFullForm);
    try {
        const personalInformation = await influenzaEmployeeInformationRepository.findOne({ user_id });
        if (personalInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Influenza personal information already exists', [
                `Influenza personal information already exists`,
            ]);
            return next(customError);
        }
        const newPersonalInformation = new personalInformation_1.InfluenzaEmployeeInformation();
        newPersonalInformation.first_name = first_name;
        newPersonalInformation.last_name = last_name;
        newPersonalInformation.department = department;
        newPersonalInformation.date_of_filling_form = date_of_filling_form;
        newPersonalInformation.user_id = user_id;
        const savedPersonalInformation = await influenzaEmployeeInformationRepository.save(newPersonalInformation);
        if (savedPersonalInformation) {
            const influenzaVaccinationDeclinationFullForm = await influenzaVaccinationDeclinationFullFormRepository.findOne({
                user_id,
            });
            if (influenzaVaccinationDeclinationFullForm) {
                influenzaVaccinationDeclinationFullForm.personal_information_id = savedPersonalInformation.id;
                influenzaVaccinationDeclinationFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await influenzaVaccinationDeclinationFullFormRepository.update(influenzaVaccinationDeclinationFullForm.id, influenzaVaccinationDeclinationFullForm);
            }
            else {
                const newInfluenzaVaccinationDeclinationFullForm = new influenzaDeclinationFullForm_1.InfluenzaVaccinationDeclinationFullForm();
                newInfluenzaVaccinationDeclinationFullForm.personal_information_id = savedPersonalInformation.id;
                newInfluenzaVaccinationDeclinationFullForm.user_id = user_id;
                newInfluenzaVaccinationDeclinationFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await influenzaVaccinationDeclinationFullFormRepository.save(newInfluenzaVaccinationDeclinationFullForm);
            }
        }
        return res.customSuccess(200, 'Influenza personal information successfully created.', savedPersonalInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addInfluenzaEmployeeForm = addInfluenzaEmployeeForm;
//# sourceMappingURL=addInfluenzaEmployeeInformation.js.map