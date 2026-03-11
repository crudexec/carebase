"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMedicalInformation = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const medicalInformation_1 = require("orm/entities/IntakeForm/medicalInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addMedicalInformation = async (req, res, next) => {
    try {
        const { diagnosis, medical_history_or_allergies, medications, other_comments, more_about_information_id, intake_full_id, } = req.body;
        const user_id = req.user.id;
        const medicalInformationRepository = (0, typeorm_1.getRepository)(medicalInformation_1.MedicalInformation);
        const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const newMedicalInformation = new medicalInformation_1.MedicalInformation();
        newMedicalInformation.diagnosis = diagnosis;
        newMedicalInformation.medical_history_or_allergies = medical_history_or_allergies;
        newMedicalInformation.medications = medications;
        newMedicalInformation.other_comments = other_comments;
        newMedicalInformation.registered_by = user_id;
        const savedMedicalInformation = await medicalInformationRepository.save(newMedicalInformation);
        if (savedMedicalInformation) {
            const newIntakeFullForm = new intakeFullForm_1.IntakeFullForm();
            const alreadyExistingIntakeFullForm = await intakeFullFormRepository.findOne({
                where: { id: intake_full_id, deleted_at: null },
            });
            if (alreadyExistingIntakeFullForm) {
                newIntakeFullForm.medical_information_id = savedMedicalInformation.id;
                await intakeFullFormRepository.update(alreadyExistingIntakeFullForm.id, newIntakeFullForm);
            }
        }
        return res.customSuccess(200, 'Medical Information successfully created.', savedMedicalInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error', null, err);
        return next(customError);
    }
};
exports.addMedicalInformation = addMedicalInformation;
//# sourceMappingURL=addMedicalInformation.js.map