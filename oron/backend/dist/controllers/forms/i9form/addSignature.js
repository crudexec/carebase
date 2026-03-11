"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillSignature = void 0;
const typeorm_1 = require("typeorm");
const i9form_1 = require("orm/entities/i9Form/i9form");
const signature_1 = require("orm/entities/i9Form/signature");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fillSignature = async (req, res, next) => {
    const { signature_data } = req.body;
    const signatureRepository = (0, typeorm_1.getRepository)(signature_1.Signature);
    const i9FormRepository = (0, typeorm_1.getRepository)(i9form_1.I9Form);
    const signed_by = req.user.id;
    try {
        const signature = await signatureRepository.findOne({ where: { signed_by } });
        if (signature) {
            const customError = new CustomError_1.CustomError(400, 'General', 'User signature information already exists for the i9 form', [
                `Signature information already exists`,
            ]);
            return next(customError);
        }
        const newSignature = new signature_1.Signature();
        newSignature.signature_data = signature_data;
        newSignature.signed_by = signed_by;
        const savedSignature = await signatureRepository.save(newSignature);
        if (savedSignature) {
            const i9Form = await i9FormRepository.findOne({ where: { owner: signed_by } });
            if (i9Form) {
                i9Form.signature_id = savedSignature.id;
                i9Form.status = genericEnums_1.Status.IN_PROGRESS;
                await i9FormRepository.save(i9Form);
            }
            else {
                const newI9Form = new i9form_1.I9Form();
                newI9Form.owner = signed_by;
                newI9Form.signature_id = savedSignature.id;
                newI9Form.status = genericEnums_1.Status.IN_PROGRESS;
                await i9FormRepository.save(newI9Form);
            }
        }
        return res.customSuccess(200, 'User signature successfully created for the i9 form.', savedSignature);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fillSignature = fillSignature;
//# sourceMappingURL=addSignature.js.map