"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFluPersonalInformation = void 0;
const typeorm_1 = require("typeorm");
const fluFullForm_1 = require("orm/entities/FluForm/fluFullForm");
const personalInformation_1 = require("orm/entities/FluForm/personalInformation");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addFluPersonalInformation = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const fluEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.FluEmployeeInformation);
        const fluFullFormRepository = (0, typeorm_1.getRepository)(fluFullForm_1.FluFullForm);
        const { first_name, last_name, job_title, date_of_filling_form } = req.body;
        const personalInformation = await fluEmployeeInformationRepository.findOne({ where: { user_id } });
        if (personalInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Flu personal information already exists', [
                `Flu personal information already exists`,
            ]);
            return next(customError);
        }
        const newPersonalInformation = new personalInformation_1.FluEmployeeInformation();
        newPersonalInformation.first_name = first_name;
        newPersonalInformation.last_name = last_name;
        newPersonalInformation.job_title = job_title;
        newPersonalInformation.date_of_filling_form = date_of_filling_form;
        newPersonalInformation.user_id = user_id;
        const savedPersonalInformation = await fluEmployeeInformationRepository.save(newPersonalInformation);
        if (savedPersonalInformation) {
            const fluFullForm = await fluFullFormRepository.findOne({ where: { user_id } });
            if (fluFullForm) {
                fluFullForm.personal_information_id = savedPersonalInformation.id;
                fluFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await fluFullFormRepository.update(fluFullForm.id, fluFullForm);
            }
            else {
                const newFluFullForm = new fluFullForm_1.FluFullForm();
                newFluFullForm.personal_information_id = savedPersonalInformation.id;
                newFluFullForm.user_id = user_id;
                newFluFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await fluFullFormRepository.save(newFluFullForm);
            }
        }
        return res.customSuccess(200, 'Flu personal information successfully created.', savedPersonalInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addFluPersonalInformation = addFluPersonalInformation;
//# sourceMappingURL=addFluPersonalInformationForm.js.map