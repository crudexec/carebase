"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitIntakeForm = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitIntakeForm = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const { intake_full_id } = req.body;
        const intakeFullForm = await intakeFullFormRepository.findOne({ where: { id: intake_full_id } });
        if (!intakeFullForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Intake Form not found`, ['Intake Form not found.']);
            return next(customError);
        }
        intakeFullForm.status = genericEnums_1.IntakeFormStatus.New_Intake;
        await intakeFullFormRepository.update(intakeFullForm.id, intakeFullForm);
        return res.customSuccess(200, 'Intake Form successfully submitted.', intakeFullForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error', null, err);
        return next(customError);
    }
};
exports.submitIntakeForm = submitIntakeForm;
//# sourceMappingURL=submitIntake.js.map