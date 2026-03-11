"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMMRPersonalInformation = void 0;
const typeorm_1 = require("typeorm");
const mmrFullForm_1 = require("orm/entities/MMRVaccineForm/mmrFullForm");
const personalInformation_1 = require("orm/entities/MMRVaccineForm/personalInformation");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addMMRPersonalInformation = async (req, res, next) => {
    const { first_name, last_name, job_title, date_of_filling_form } = req.body;
    const mmrEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.MMREmployeeInformation);
    const mmrFullFormRepository = (0, typeorm_1.getRepository)(mmrFullForm_1.MMRFullForm);
    const user_id = req.user.id;
    try {
        const personalInformation = await mmrEmployeeInformationRepository.findOne({ where: { user_id } });
        if (personalInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Personal information already exists', [
                `Personal information already exists`,
            ]);
            return next(customError);
        }
        const newPersonalInformation = new personalInformation_1.MMREmployeeInformation();
        newPersonalInformation.first_name = first_name;
        newPersonalInformation.last_name = last_name;
        newPersonalInformation.job_title = job_title;
        newPersonalInformation.date_of_filling_form = date_of_filling_form;
        newPersonalInformation.user_id = user_id;
        const savedPersonalInformation = await mmrEmployeeInformationRepository.save(newPersonalInformation);
        if (savedPersonalInformation) {
            const mmrFullForm = await mmrFullFormRepository.findOne({ where: { user_id } });
            if (mmrFullForm) {
                mmrFullForm.personal_information_id = savedPersonalInformation.id;
                mmrFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await mmrFullFormRepository.save(mmrFullForm);
            }
            else {
                const newMMRFullForm = new mmrFullForm_1.MMRFullForm();
                newMMRFullForm.user_id = user_id;
                newMMRFullForm.personal_information_id = savedPersonalInformation.id;
                newMMRFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await mmrFullFormRepository.save(newMMRFullForm);
            }
        }
        return res.customSuccess(200, ' Personal Information successfully created.', savedPersonalInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addMMRPersonalInformation = addMMRPersonalInformation;
//# sourceMappingURL=addMMRPersonalInformation.js.map