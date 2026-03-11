"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMMRSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const mmrFullForm_1 = require("orm/entities/MMRVaccineForm/mmrFullForm");
const mmrSignatureForm_1 = require("orm/entities/MMRVaccineForm/mmrSignatureForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addMMRSignatureForm = async (req, res, next) => {
    const { signature_data } = req.body;
    const mmrSignatureFormRepository = (0, typeorm_1.getRepository)(mmrSignatureForm_1.MMRSignatureForm);
    const mmrFullFormRepository = (0, typeorm_1.getRepository)(mmrFullForm_1.MMRFullForm);
    const signed_by = req.user.id;
    try {
        const newMMRSignatureForm = new mmrSignatureForm_1.MMRSignatureForm();
        const mmrSignatureForm = await mmrSignatureFormRepository.findOne({ where: { signed_by } });
        if (mmrSignatureForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Signature form already exists', [
                `Signature form already exists`,
            ]);
            return next(customError);
        }
        else {
            newMMRSignatureForm.signature_data = signature_data;
            newMMRSignatureForm.signed_by = signed_by;
            const savedMMRSignatureForm = await mmrSignatureFormRepository.save(newMMRSignatureForm);
            if (savedMMRSignatureForm) {
                const mmrFullForm = await mmrFullFormRepository.findOne({ where: { user_id: signed_by } });
                if (mmrFullForm) {
                    mmrFullForm.signature_id = savedMMRSignatureForm.id;
                    await mmrFullFormRepository.save(mmrFullForm);
                }
                else {
                    const newMMRFullForm = new mmrFullForm_1.MMRFullForm();
                    newMMRFullForm.user_id = signed_by;
                    newMMRFullForm.signature_id = savedMMRSignatureForm.id;
                    await mmrFullFormRepository.save(newMMRFullForm);
                }
            }
            return res.customSuccess(200, 'Signature form successfully created.', savedMMRSignatureForm);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addMMRSignatureForm = addMMRSignatureForm;
//# sourceMappingURL=addMMRSignatureForm.js.map