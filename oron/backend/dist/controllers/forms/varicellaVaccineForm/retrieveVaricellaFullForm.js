"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveFullVaricellaForm = void 0;
const typeorm_1 = require("typeorm");
const personalInformation_1 = require("orm/entities/VaricellaVaccineForm/personalInformation");
const varicellaAttestation_1 = require("orm/entities/VaricellaVaccineForm/varicellaAttestation");
const varicellaFullForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaFullForm");
const varicellaSignatureForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaSignatureForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveFullVaricellaForm = async (req, res, next) => {
    const user_id = req.user.id;
    const VaricellaSignatureFormRepository = (0, typeorm_1.getRepository)(varicellaSignatureForm_1.VaricellaSignatureForm);
    const VaricellaFullFormRepository = (0, typeorm_1.getRepository)(varicellaFullForm_1.VaricellaFullForm);
    const VaricellaAttestationFormRepository = (0, typeorm_1.getRepository)(varicellaAttestation_1.VaricellaAttestationForm);
    const VaricellaEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.VaricellaEmployeeInformation);
    try {
        const varicellaSignatureForm = (await VaricellaSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};
        const varicellaAttestationForm = (await VaricellaAttestationFormRepository.findOne({ where: { user_id } })) || {};
        const varicellaEmployeeInformation = (await VaricellaEmployeeInformationRepository.findOne({ where: { user_id } })) || {};
        const varicellaFullForm = (await VaricellaFullFormRepository.findOne({ where: { user_id } })) || {
            status: genericEnums_1.Status.NOT_STARTED,
        };
        return res.customSuccess(200, 'Full Varicella form successfully retrieved.', {
            varicellaSignatureForm,
            varicellaAttestationForm,
            varicellaEmployeeInformation,
            varicellaFullForm,
            status: varicellaFullForm.status,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveFullVaricellaForm = retrieveFullVaricellaForm;
//# sourceMappingURL=retrieveVaricellaFullForm.js.map