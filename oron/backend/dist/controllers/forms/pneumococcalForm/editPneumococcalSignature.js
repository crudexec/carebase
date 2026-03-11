"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPneumococcalSignature = void 0;
const typeorm_1 = require("typeorm");
const pneumoccalSignature_1 = require("orm/entities/PneumoccalVaccinationForm/pneumoccalSignature");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editPneumococcalSignature = async (req, res, next) => {
    let { signature_data } = req.body;
    const signatureRepository = (0, typeorm_1.getRepository)(pneumoccalSignature_1.PneumococcalSignatureForm);
    const signed_by = req.user.id;
    try {
        const signature = await signatureRepository.findOne({ where: { signed_by } });
        if (signature) {
            signature_data = signature_data ?? signature.signature_data;
            const newSignature = new pneumoccalSignature_1.PneumococcalSignatureForm();
            newSignature.signature_data = signature_data;
            newSignature.updated_at = new Date();
            await signatureRepository.update(signature.id, newSignature);
            return res.customSuccess(200, 'User signature successfully updated for the pneumococcal vaccination form.', newSignature);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'User signature information does not exist for the pneumococcal vaccination form', [`Signature information does not exist`]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editPneumococcalSignature = editPneumococcalSignature;
//# sourceMappingURL=editPneumococcalSignature.js.map