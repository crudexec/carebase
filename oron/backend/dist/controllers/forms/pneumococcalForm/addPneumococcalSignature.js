"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillPneumococcalSignature = void 0;
const typeorm_1 = require("typeorm");
const pneumoccalSignature_1 = require("orm/entities/PneumoccalVaccinationForm/pneumoccalSignature");
const pneumococcalFullForm_1 = require("orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fillPneumococcalSignature = async (req, res, next) => {
    const { signature_data } = req.body;
    const signatureRepository = (0, typeorm_1.getRepository)(pneumoccalSignature_1.PneumococcalSignatureForm);
    const pneumococcalVaccinationFullFormRepository = (0, typeorm_1.getRepository)(pneumococcalFullForm_1.PneumococcalVaccinationFullForm);
    const signed_by = req.user.id;
    try {
        const signature = await signatureRepository.findOne({ where: { signed_by } });
        if (signature) {
            const customError = new CustomError_1.CustomError(400, 'General', 'User signature information already exists for the pneumococcal vaccination form', [`Signature information already exists`]);
            return next(customError);
        }
        const newSignature = new pneumoccalSignature_1.PneumococcalSignatureForm();
        newSignature.signature_data = signature_data;
        newSignature.signed_by = signed_by;
        const savedSignature = await signatureRepository.save(newSignature);
        if (savedSignature) {
            const pneumococcalVaccinationForm = await pneumococcalVaccinationFullFormRepository.findOne({
                where: { user_id: signed_by },
            });
            if (pneumococcalVaccinationForm) {
                pneumococcalVaccinationForm.pneumococcal_signature_id = savedSignature.id;
                await pneumococcalVaccinationFullFormRepository.save(pneumococcalVaccinationForm);
            }
            else {
                const newPneumococcalVaccinationFullForm = new pneumococcalFullForm_1.PneumococcalVaccinationFullForm();
                newPneumococcalVaccinationFullForm.user_id = signed_by;
                newPneumococcalVaccinationFullForm.pneumococcal_signature_id = savedSignature.id;
                await pneumococcalVaccinationFullFormRepository.save(newPneumococcalVaccinationFullForm);
            }
        }
        return res.customSuccess(200, 'User signature successfully created for the pneumococcal vaccination form.', savedSignature);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fillPneumococcalSignature = fillPneumococcalSignature;
//# sourceMappingURL=addPneumococcalSignature.js.map