"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addN95AttestationForm = void 0;
const typeorm_1 = require("typeorm");
const attestationForm_1 = require("orm/entities/N95Form/attestationForm");
const n95FullForm_1 = require("orm/entities/N95Form/n95FullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addN95AttestationForm = async (req, res, next) => {
    const { status_received_n95_fit_testing } = req.body;
    const user_id = req.user.id;
    const n95FitAttestationFormRepository = (0, typeorm_1.getRepository)(attestationForm_1.N95FitAttestationForm);
    const n95FitFullFormRepository = (0, typeorm_1.getRepository)(n95FullForm_1.N95FitFullForm);
    try {
        const attestationForm = await n95FitAttestationFormRepository.findOne({ where: { user_id } });
        if (attestationForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Attestation form already exists', [
                `Attestation form already exists`,
            ]);
            return next(customError);
        }
        const newAttestationForm = new attestationForm_1.N95FitAttestationForm();
        newAttestationForm.status_received_n95_fit_testing = status_received_n95_fit_testing;
        newAttestationForm.user_id = user_id;
        const savedAttestationForm = await n95FitAttestationFormRepository.save(newAttestationForm);
        if (savedAttestationForm) {
            const fullForm = await n95FitFullFormRepository.findOne({ where: { user_id } });
            if (fullForm) {
                fullForm.attestation_id = savedAttestationForm.id;
                fullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await n95FitFullFormRepository.save(fullForm);
            }
            else {
                const newFullForm = new n95FullForm_1.N95FitFullForm();
                newFullForm.user_id = user_id;
                newFullForm.attestation_id = savedAttestationForm.id;
                newFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await n95FitFullFormRepository.save(newFullForm);
            }
        }
        return res.customSuccess(200, 'N95 form attestation successfully created.', savedAttestationForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addN95AttestationForm = addN95AttestationForm;
//# sourceMappingURL=addN95AttestationForm.js.map