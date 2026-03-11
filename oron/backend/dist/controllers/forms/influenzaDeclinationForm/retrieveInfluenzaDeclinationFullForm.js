"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveInfluenzaDeclinationFullForm = void 0;
const typeorm_1 = require("typeorm");
const declinationInfluenzaForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/declinationInfluenzaForm");
const influenzaDeclinationFullForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm");
const personalInformation_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/personalInformation");
const signatureForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/signatureForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveInfluenzaDeclinationFullForm = async (req, res, next) => {
    const user_id = req.user.id;
    const influenzaSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_1.InfluenzaSignatureForm);
    const influenzaVaccinationDeclinationFullFormRepository = (0, typeorm_1.getRepository)(influenzaDeclinationFullForm_1.InfluenzaVaccinationDeclinationFullForm);
    const influenzaVaccinationDeclinationFormRepository = (0, typeorm_1.getRepository)(declinationInfluenzaForm_1.InfluenzaVaccinationDeclinationForm);
    const influenzaEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.InfluenzaEmployeeInformation);
    try {
        const personalInformation = (await influenzaEmployeeInformationRepository.findOne({ user_id })) || {};
        const declinationForm = (await influenzaVaccinationDeclinationFormRepository.findOne({ user_id })) || {};
        const signatureForm = (await influenzaSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};
        const influenzaFullForm = (await influenzaVaccinationDeclinationFullFormRepository.findOne({
            where: { user_id },
        })) || { status: genericEnums_1.Status.NOT_STARTED };
        return res.customSuccess(200, 'Influenza form successfully retrieved.', {
            personalInformation,
            declinationForm,
            signatureForm,
            influenzaFullForm,
            status: influenzaFullForm.status,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveInfluenzaDeclinationFullForm = retrieveInfluenzaDeclinationFullForm;
//# sourceMappingURL=retrieveInfluenzaDeclinationFullForm.js.map