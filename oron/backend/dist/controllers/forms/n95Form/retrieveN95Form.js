"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveN95Form = void 0;
const typeorm_1 = require("typeorm");
const attestationForm_1 = require("orm/entities/N95Form/attestationForm");
const n95FullForm_1 = require("orm/entities/N95Form/n95FullForm");
const signatureForm_1 = require("orm/entities/N95Form/signatureForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveN95Form = async (req, res, next) => {
    const user_id = req.user.id;
    const n95FitSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_1.N95FitSignatureForm);
    const n95FitFullFormRepository = (0, typeorm_1.getRepository)(n95FullForm_1.N95FitFullForm);
    const n95FitAttestationFormRepository = (0, typeorm_1.getRepository)(attestationForm_1.N95FitAttestationForm);
    try {
        const signatureForm = (await n95FitSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};
        const fullForm = (await n95FitFullFormRepository.findOne({ where: { user_id } })) || {
            status: genericEnums_1.Status.AWAITING_APPROVAL,
        };
        const attestationForm = (await n95FitAttestationFormRepository.findOne({ where: { user_id } })) || {};
        return res.customSuccess(200, 'N95 signature form successfully created.', {
            signatureForm,
            fullForm,
            attestationForm,
            status: fullForm.status,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveN95Form = retrieveN95Form;
//# sourceMappingURL=retrieveN95Form.js.map