"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editMedicalInformation = void 0;
const typeorm_1 = require("typeorm");
const medicalInformation_1 = require("orm/entities/IntakeForm/medicalInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editMedicalInformation = async (req, res, next) => {
    try {
        let { diagnosis, medical_history_or_allergies, medications, other_comments } = req.body;
        const form_id = req.params.form_id;
        const medicalInformationRepository = (0, typeorm_1.getRepository)(medicalInformation_1.MedicalInformation);
        const medicalInformation = await medicalInformationRepository.findOne({ where: { id: form_id } });
        if (!medicalInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Medical Information already exists', [
                `Medical Information already exists`,
            ]);
            return next(customError);
        }
        diagnosis = diagnosis ?? medicalInformation.diagnosis;
        medical_history_or_allergies = medical_history_or_allergies ?? medicalInformation.medical_history_or_allergies;
        medications = medications ?? medicalInformation.medications;
        other_comments = other_comments ?? medicalInformation.other_comments;
        const updatedMedicalInformation = new medicalInformation_1.MedicalInformation();
        updatedMedicalInformation.diagnosis = diagnosis;
        updatedMedicalInformation.medical_history_or_allergies = medical_history_or_allergies;
        updatedMedicalInformation.medications = medications;
        updatedMedicalInformation.other_comments = other_comments;
        await medicalInformationRepository.update({ id: medicalInformation.id }, updatedMedicalInformation);
        return res.customSuccess(200, 'Medical Information successfully updated.', updatedMedicalInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error', null, err);
        return next(customError);
    }
};
exports.editMedicalInformation = editMedicalInformation;
//# sourceMappingURL=editMedicalInformation.js.map