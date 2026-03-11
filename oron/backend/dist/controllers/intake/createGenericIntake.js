"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGenericIntake = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const createGenericIntake = async (req, res, next) => {
    try {
        const intakeRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const { first_name, last_name } = req.body;
        const registered_by = req.user.id;
        const account_id = req.user.account_id;
        const intake = new intakeFullForm_1.IntakeFullForm();
        intake.first_name = first_name;
        intake.last_name = last_name;
        intake.registered_by = registered_by;
        intake.account_id = account_id;
        const savedIntake = await intakeRepository.save(intake);
        return res.customSuccess(200, 'Intake Form successfully created.', savedIntake);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Creating Intake Form', null, err);
        return next(customError);
    }
};
exports.createGenericIntake = createGenericIntake;
//# sourceMappingURL=createGenericIntake.js.map