"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editSignatureData = void 0;
const typeorm_1 = require("typeorm");
const cjisSignature_1 = require("orm/entities/CJISForm/cjisSignature");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editSignatureData = async (req, res, next) => {
    let { signature_data } = req.body;
    try {
        const signatureRepository = (0, typeorm_1.getRepository)(cjisSignature_1.CJISSignatureForm);
        const user_id = req.user.id;
        const cjisSignature = await signatureRepository.findOne({ where: { signed_by: user_id } });
        if (!cjisSignature) {
            const customError = new CustomError_1.CustomError(400, 'General', 'CJIS Signature does not exist', [
                `CJIS Signature Form does not exist`,
            ]);
            return next(customError);
        }
        signature_data = signature_data ?? cjisSignature.signature_data;
        const newCJISSignature = new cjisSignature_1.CJISSignatureForm();
        newCJISSignature.signature_data = signature_data;
        await signatureRepository.update(cjisSignature.id, newCJISSignature);
        return res.customSuccess(200, 'CJIS Signature Form successfully updated.', newCJISSignature);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editSignatureData = editSignatureData;
//# sourceMappingURL=editSignature.js.map