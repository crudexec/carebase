"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveHepatitisBForm = void 0;
const typeorm_1 = require("typeorm");
const attestationForm_1 = require("orm/entities/HepatitisBForm/attestationForm");
const HepatitisFullForm_1 = require("orm/entities/HepatitisBForm/HepatitisFullForm");
const personalInformation_1 = require("orm/entities/HepatitisBForm/personalInformation");
const signatureForm_1 = require("orm/entities/HepatitisBForm/signatureForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveHepatitisBForm = async (req, res, next) => {
    const HepatitisBFullFormRepository = (0, typeorm_1.getRepository)(HepatitisFullForm_1.HepatitisBFullForm);
    const HepatitisBPersonalInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.PersonalInformationHepatitisBForm);
    const HepatitisBSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_1.HepatitisBSignatureForm);
    const HepatitisBAttestationFormRepository = (0, typeorm_1.getRepository)(attestationForm_1.HepatitisBAttestationForm);
    const user_id = req.user.id;
    try {
        const personalInformation = (await HepatitisBPersonalInformationRepository.findOne({ where: { user_id } })) || {};
        const signatureInformation = (await HepatitisBSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};
        const attestationInformation = (await HepatitisBAttestationFormRepository.findOne({ where: { user_id } })) || {};
        const hepatitisBFullForm = (await HepatitisBFullFormRepository.findOne({ where: { user_id } })) || {
            status: genericEnums_1.Status.NOT_STARTED,
        };
        return res.customSuccess(200, 'Hepatitis B form successfully retrieved.', {
            personalInformation,
            signatureInformation,
            attestationInformation,
            hepatitisBFullForm,
            status: hepatitisBFullForm.status,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveHepatitisBForm = retrieveHepatitisBForm;
//# sourceMappingURL=retrieveHepatitisBForm.js.map