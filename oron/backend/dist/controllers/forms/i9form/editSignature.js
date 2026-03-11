"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editSignature = void 0;
const typeorm_1 = require("typeorm");
const signature_1 = require("orm/entities/i9Form/signature");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editSignature = async (req, res, next) => {
    let { signature_data } = req.body;
    const signatureRepository = (0, typeorm_1.getRepository)(signature_1.Signature);
    const signed_by = req.user.id;
    try {
        const signature = await signatureRepository.findOne({ where: { signed_by } });
        if (signature) {
            signature_data = signature_data ?? signature.signature_data;
            const newSignature = new signature_1.Signature();
            newSignature.signature_data = signature_data;
            newSignature.signed_by = signed_by;
            await signatureRepository.update(signature.id, newSignature);
            return res.customSuccess(200, 'User signature data successfully updated for the i9 form.', newSignature);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'User signature information does not exists for the i9 form', [`Signature information does not exists`]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editSignature = editSignature;
//# sourceMappingURL=editSignature.js.map