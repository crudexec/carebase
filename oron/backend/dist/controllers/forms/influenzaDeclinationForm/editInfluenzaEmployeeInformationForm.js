"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editInfluenzaEmployeeForm = void 0;
const typeorm_1 = require("typeorm");
const personalInformation_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/personalInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editInfluenzaEmployeeForm = async (req, res, next) => {
    let { first_name, last_name, department } = req.body;
    const user_id = req.user.id;
    const influenzaEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.InfluenzaEmployeeInformation);
    try {
        const personalInformation = await influenzaEmployeeInformationRepository.findOne({ user_id });
        if (personalInformation) {
            first_name = first_name ?? personalInformation.first_name;
            last_name = last_name ?? personalInformation.last_name;
            department = department ?? personalInformation.department;
            const newPersonalInformation = new personalInformation_1.InfluenzaEmployeeInformation();
            newPersonalInformation.first_name = first_name;
            newPersonalInformation.last_name = last_name;
            newPersonalInformation.department = department;
            await influenzaEmployeeInformationRepository.update(personalInformation.id, newPersonalInformation);
            return res.customSuccess(200, ' Personal Information successfully updated.', newPersonalInformation);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Influenza personal information does not exist', [
                `Influenza personal information does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editInfluenzaEmployeeForm = editInfluenzaEmployeeForm;
//# sourceMappingURL=editInfluenzaEmployeeInformationForm.js.map