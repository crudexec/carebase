"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSignatureData = void 0;
const typeorm_1 = require("typeorm");
const cjisFullForm_1 = require("orm/entities/CJISForm/cjisFullForm");
const cjisSignature_1 = require("orm/entities/CJISForm/cjisSignature");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addSignatureData = async (req, res, next) => {
    const { signature_data } = req.body;
    try {
        const signatureRepository = (0, typeorm_1.getRepository)(cjisSignature_1.CJISSignatureForm);
        const cjisFullFormRepository = (0, typeorm_1.getRepository)(cjisFullForm_1.CJISFullForm);
        const user_id = req.user.id;
        const cjisSignature = await signatureRepository.findOne({ where: { signed_by: user_id } });
        if (cjisSignature) {
            const customError = new CustomError_1.CustomError(400, 'General', 'CJIS Signature already exists', [
                `CJIS Signature Form already exists`,
            ]);
            return next(customError);
        }
        const newCJISSignature = new cjisSignature_1.CJISSignatureForm();
        newCJISSignature.signature_data = signature_data;
        newCJISSignature.signed_by = user_id;
        const savedCJISSignature = await signatureRepository.save(newCJISSignature);
        if (savedCJISSignature) {
            const newCJISForm = new cjisFullForm_1.CJISFullForm();
            const cjisForm = await cjisFullFormRepository.findOne({ where: { user_id } });
            if (cjisForm) {
                newCJISForm.signature_id = savedCJISSignature.id;
                newCJISForm.status = genericEnums_1.Status.IN_PROGRESS;
                await cjisFullFormRepository.update(cjisForm.id, newCJISForm);
                return res.customSuccess(200, 'CJIS Signature Form successfully created.', savedCJISSignature);
            }
            newCJISForm.signature_id = savedCJISSignature.id;
            newCJISForm.status = genericEnums_1.Status.IN_PROGRESS;
            await cjisFullFormRepository.save(newCJISForm);
            return res.customSuccess(200, 'CJIS Signature Form successfully created.', savedCJISSignature);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addSignatureData = addSignatureData;
//# sourceMappingURL=addSignature.js.map