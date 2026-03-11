"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilPictureForIntake = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const uploadProfilPictureForIntake = async (req, res, next) => {
    try {
        const intake_full_id = req.params.intake_full_id;
        const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const { profile_picture } = req.body;
        const intakeFullForm = await intakeFullFormRepository.findOne({ where: { id: intake_full_id } });
        if (!intakeFullForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Intake Form not found`, ['Intake Form not found.']);
            return next(customError);
        }
        intakeFullForm.profile_picture = profile_picture;
        await intakeFullFormRepository.update(intakeFullForm.id, intakeFullForm);
        return res.customSuccess(200, 'Intake Form successfully submitted.', intakeFullForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Uploading Intake Profile Picture', null, err);
        return next(customError);
    }
};
exports.uploadProfilPictureForIntake = uploadProfilPictureForIntake;
//# sourceMappingURL=uploadProfilePicture.js.map