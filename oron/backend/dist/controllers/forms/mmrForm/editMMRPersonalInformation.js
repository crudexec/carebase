"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editMMRPersonalInformation = void 0;
const typeorm_1 = require("typeorm");
const personalInformation_1 = require("orm/entities/MMRVaccineForm/personalInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editMMRPersonalInformation = async (req, res, next) => {
    let { first_name, last_name, job_title, date_of_filling_form } = req.body;
    const mmrEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.MMREmployeeInformation);
    const user_id = req.user.id;
    try {
        const personalInformation = await mmrEmployeeInformationRepository.findOne({ where: { user_id } });
        if (personalInformation) {
            first_name = first_name ?? personalInformation.first_name;
            last_name = last_name ?? personalInformation.last_name;
            job_title = job_title ?? personalInformation.job_title;
            date_of_filling_form = date_of_filling_form ?? personalInformation.date_of_filling_form;
            const newPersonalInformation = new personalInformation_1.MMREmployeeInformation();
            newPersonalInformation.first_name = first_name;
            newPersonalInformation.last_name = last_name;
            newPersonalInformation.job_title = job_title;
            newPersonalInformation.date_of_filling_form = date_of_filling_form;
            await mmrEmployeeInformationRepository.update(personalInformation.id, newPersonalInformation);
            return res.customSuccess(200, ' Personal Information successfully updated.', newPersonalInformation);
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
exports.editMMRPersonalInformation = editMMRPersonalInformation;
//# sourceMappingURL=editMMRPersonalInformation.js.map