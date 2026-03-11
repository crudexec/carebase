"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVaricellaPersonalInformationForm = void 0;
const typeorm_1 = require("typeorm");
const personalInformation_1 = require("orm/entities/VaricellaVaccineForm/personalInformation");
const varicellaFullForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addVaricellaPersonalInformationForm = async (req, res, next) => {
    const { first_name, last_name, job_title, date_of_filling_form } = req.body;
    const user_id = req.user.id;
    const VaricellaEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.VaricellaEmployeeInformation);
    const VaricellaFullFormRepository = (0, typeorm_1.getRepository)(varicellaFullForm_1.VaricellaFullForm);
    try {
        const newVaricellaEmployeeInformation = new personalInformation_1.VaricellaEmployeeInformation();
        const varicellaEmployeeInformation = await VaricellaEmployeeInformationRepository.findOne({ where: { user_id } });
        if (varicellaEmployeeInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Personal information already exists', [
                `Personal information already exists`,
            ]);
            return next(customError);
        }
        newVaricellaEmployeeInformation.first_name = first_name;
        newVaricellaEmployeeInformation.last_name = last_name;
        newVaricellaEmployeeInformation.job_title = job_title;
        newVaricellaEmployeeInformation.date_of_filling_form = date_of_filling_form;
        newVaricellaEmployeeInformation.user_id = user_id;
        const savedVaricellaEmployeeInformation = await VaricellaEmployeeInformationRepository.save(newVaricellaEmployeeInformation);
        if (savedVaricellaEmployeeInformation) {
            const varicellaFullForm = await VaricellaFullFormRepository.findOne({ where: { user_id } });
            if (varicellaFullForm) {
                varicellaFullForm.personal_information_id = savedVaricellaEmployeeInformation.id;
                varicellaFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await VaricellaFullFormRepository.save(varicellaFullForm);
            }
            else {
                const newVaricellaFullForm = new varicellaFullForm_1.VaricellaFullForm();
                newVaricellaFullForm.user_id = user_id;
                newVaricellaFullForm.personal_information_id = savedVaricellaEmployeeInformation.id;
                newVaricellaFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await VaricellaFullFormRepository.save(newVaricellaFullForm);
            }
        }
        return res.customSuccess(200, ' Personal Information successfully created.', savedVaricellaEmployeeInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addVaricellaPersonalInformationForm = addVaricellaPersonalInformationForm;
//# sourceMappingURL=addVaricellaPersonalInformation.js.map