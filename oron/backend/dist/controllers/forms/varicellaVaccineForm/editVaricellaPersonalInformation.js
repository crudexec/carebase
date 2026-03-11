"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editVaricellaPersonalInformationForm = void 0;
const typeorm_1 = require("typeorm");
const personalInformation_1 = require("orm/entities/VaricellaVaccineForm/personalInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editVaricellaPersonalInformationForm = async (req, res, next) => {
    let { first_name, last_name, job_title } = req.body;
    const user_id = req.user.id;
    const VaricellaEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.VaricellaEmployeeInformation);
    try {
        const newVaricellaEmployeeInformation = new personalInformation_1.VaricellaEmployeeInformation();
        const varicellaEmployeeInformation = await VaricellaEmployeeInformationRepository.findOne({ where: { user_id } });
        if (varicellaEmployeeInformation) {
            first_name = first_name ?? varicellaEmployeeInformation.first_name;
            last_name = last_name ?? varicellaEmployeeInformation.last_name;
            job_title = job_title ?? varicellaEmployeeInformation.job_title;
            newVaricellaEmployeeInformation.first_name = first_name;
            newVaricellaEmployeeInformation.last_name = last_name;
            newVaricellaEmployeeInformation.job_title = job_title;
            await VaricellaEmployeeInformationRepository.update(varicellaEmployeeInformation.id, newVaricellaEmployeeInformation);
            return res.customSuccess(200, ' Personal Information successfully updated.', newVaricellaEmployeeInformation);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Personal information does not exist', [
                `Personal information does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editVaricellaPersonalInformationForm = editVaricellaPersonalInformationForm;
//# sourceMappingURL=editVaricellaPersonalInformation.js.map