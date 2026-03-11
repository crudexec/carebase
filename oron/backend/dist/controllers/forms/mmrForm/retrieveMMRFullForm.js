"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveMMRFullForm = void 0;
const typeorm_1 = require("typeorm");
const mmrAttestationForm_1 = require("orm/entities/MMRVaccineForm/mmrAttestationForm");
const mmrFullForm_1 = require("orm/entities/MMRVaccineForm/mmrFullForm");
const mmrSignatureForm_1 = require("orm/entities/MMRVaccineForm/mmrSignatureForm");
const personalInformation_1 = require("orm/entities/MMRVaccineForm/personalInformation");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveMMRFullForm = async (req, res, next) => {
    const mmrSignatureFormRepository = (0, typeorm_1.getRepository)(mmrSignatureForm_1.MMRSignatureForm);
    const mmrFullFormRepository = (0, typeorm_1.getRepository)(mmrFullForm_1.MMRFullForm);
    const mmrEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.MMREmployeeInformation);
    const mmrAttestationFormRepository = (0, typeorm_1.getRepository)(mmrAttestationForm_1.MMRAttestationForm);
    const user_id = req.user.id;
    try {
        const mmrFullForm = (await mmrFullFormRepository.findOne({ where: { user_id } })) || { status: genericEnums_1.Status.NOT_STARTED };
        const mmrEmployeeInformation = (await mmrEmployeeInformationRepository.findOne({ where: { user_id } })) || {};
        const mmrAttestationForm = (await mmrAttestationFormRepository.findOne({ where: { user_id } })) || {};
        const mmrSignatureForm = (await mmrSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};
        return res.customSuccess(200, 'Form successfully retrieved.', {
            mmrFullForm,
            mmrEmployeeInformation,
            mmrAttestationForm,
            mmrSignatureForm,
            status: mmrFullForm.status,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveMMRFullForm = retrieveMMRFullForm;
//# sourceMappingURL=retrieveMMRFullForm.js.map