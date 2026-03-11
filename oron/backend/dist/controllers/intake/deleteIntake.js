"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIntake = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const deleteIntake = async (req, res, next) => {
    const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
    const account_id = req.user.account_id;
    const intake_full_id = req.params.intake_full_id;
    try {
        const intakeFullForm = await intakeFullFormRepository.findOne({
            where: { id: intake_full_id, account_id, deleted_at: null },
        });
        if (!intakeFullForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Intake Form not found`, ['Intake Form not found.']);
            return next(customError);
        }
        await intakeFullFormRepository.softDelete(intakeFullForm.id);
        return res.customSuccess(200, 'Intake Full Form successfully deleted', null);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error deleting intake form', null, err);
        return next(customError);
    }
};
exports.deleteIntake = deleteIntake;
//# sourceMappingURL=deleteIntake.js.map