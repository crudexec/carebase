"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editN95AttestationForm = void 0;
const typeorm_1 = require("typeorm");
const attestationForm_1 = require("orm/entities/N95Form/attestationForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editN95AttestationForm = async (req, res, next) => {
    let { status_received_n95_fit_testing } = req.body;
    const user_id = req.user.id;
    const n95FitAttestationFormRepository = (0, typeorm_1.getRepository)(attestationForm_1.N95FitAttestationForm);
    try {
        const attestationForm = await n95FitAttestationFormRepository.findOne({ where: { user_id } });
        if (attestationForm) {
            status_received_n95_fit_testing =
                status_received_n95_fit_testing ?? attestationForm.status_received_n95_fit_testing;
            const newAttestationForm = new attestationForm_1.N95FitAttestationForm();
            newAttestationForm.status_received_n95_fit_testing = status_received_n95_fit_testing;
            await n95FitAttestationFormRepository.update(attestationForm.id, newAttestationForm);
            return res.customSuccess(200, 'N95 attestation form successfully updated.', newAttestationForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'N95 attestation form does not exist', [
                `N95 attestation form does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editN95AttestationForm = editN95AttestationForm;
//# sourceMappingURL=editN95AttestationForm.js.map