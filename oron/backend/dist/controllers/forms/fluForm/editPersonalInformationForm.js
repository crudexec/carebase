"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFluPersonalInformation = void 0;
const typeorm_1 = require("typeorm");
const personalInformation_1 = require("orm/entities/FluForm/personalInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editFluPersonalInformation = async (req, res, next) => {
    const user_id = req.user.id;
    const fluEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.FluEmployeeInformation);
    let { first_name, last_name, job_title } = req.body;
    try {
        const personalInformation = await fluEmployeeInformationRepository.findOne({ user_id });
        if (personalInformation) {
            first_name = first_name ?? personalInformation.first_name;
            last_name = last_name ?? personalInformation.last_name;
            job_title = job_title ?? personalInformation.job_title;
            const newPersonalInformation = new personalInformation_1.FluEmployeeInformation();
            newPersonalInformation.first_name = first_name;
            newPersonalInformation.last_name = last_name;
            newPersonalInformation.job_title = job_title;
            await fluEmployeeInformationRepository.update(personalInformation.id, newPersonalInformation);
            return res.customSuccess(200, 'Flu personal information successfully updated.', newPersonalInformation);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Flu personal information does not exist', [
                `Flu personal information does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editFluPersonalInformation = editFluPersonalInformation;
//# sourceMappingURL=editPersonalInformationForm.js.map