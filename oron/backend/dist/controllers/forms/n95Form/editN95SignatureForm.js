"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editN95SignatureForm = void 0;
const typeorm_1 = require("typeorm");
const signatureForm_1 = require("orm/entities/N95Form/signatureForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editN95SignatureForm = async (req, res, next) => {
    let { signature_data, full_name } = req.body;
    const user_id = req.user.id;
    const n95FitSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_1.N95FitSignatureForm);
    try {
        const signatureForm = await n95FitSignatureFormRepository.findOne({ where: { signed_by: user_id } });
        if (signatureForm) {
            signature_data = signature_data ?? signatureForm.signature_data;
            full_name = full_name ?? signatureForm.full_name;
            const newSignatureForm = new signatureForm_1.N95FitSignatureForm();
            newSignatureForm.signature_data = signature_data;
            newSignatureForm.full_name = full_name;
            await n95FitSignatureFormRepository.update(signatureForm.id, newSignatureForm);
            return res.customSuccess(200, 'N95 signature form successfully updated.', newSignatureForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'N95 signature form does not exist', [
                `N95 signature form does not exist`,
            ]);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editN95SignatureForm = editN95SignatureForm;
//# sourceMappingURL=editN95SignatureForm.js.map