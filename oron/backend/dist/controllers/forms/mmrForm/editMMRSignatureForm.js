"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editMMRSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const mmrSignatureForm_1 = require("orm/entities/MMRVaccineForm/mmrSignatureForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editMMRSignatureForm = async (req, res, next) => {
    let { signature_data } = req.body;
    const mmrSignatureFormRepository = (0, typeorm_1.getRepository)(mmrSignatureForm_1.MMRSignatureForm);
    const signed_by = req.user.id;
    try {
        const newMMRSignatureForm = new mmrSignatureForm_1.MMRSignatureForm();
        const mmrSignatureForm = await mmrSignatureFormRepository.findOne({ where: { signed_by } });
        if (mmrSignatureForm) {
            signature_data = signature_data ?? mmrSignatureForm.signature_data;
            newMMRSignatureForm.signature_data = signature_data;
            await mmrSignatureFormRepository.update(mmrSignatureForm.id, newMMRSignatureForm);
            return res.customSuccess(200, 'Signature form successfully updated.', newMMRSignatureForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Signature form does not exist', [
                `Signature form does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editMMRSignatureForm = editMMRSignatureForm;
//# sourceMappingURL=editMMRSignatureForm.js.map