"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTreatmentSchedule = void 0;
const typeorm_1 = require("typeorm");
const treatmentSchedule_1 = require("orm/entities/TreatmentPlan/treatmentSchedule");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editTreatmentSchedule = async (req, res, next) => {
    const connection = (0, typeorm_1.getConnection)();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    try {
        await queryRunner.startTransaction();
        let { end_date, start_date, time_slot } = req.body;
        const form_id = req.params.form_id;
        const scheduleRepository = connection.getRepository(treatmentSchedule_1.TreatmentSchedule);
        const alreadyExistingSchedule = await scheduleRepository.findOne({
            where: { id: form_id },
        });
        if (!alreadyExistingSchedule) {
            const customError = new CustomError_1.CustomError(404, 'General', `Schedule Information not found`, [
                'Schedule Information not found.',
            ]);
            return next(customError);
        }
        end_date = end_date ?? alreadyExistingSchedule.end_date;
        start_date = start_date ?? alreadyExistingSchedule.start_date;
        time_slot = time_slot ?? alreadyExistingSchedule.time_slot;
        const newSchedule = new treatmentSchedule_1.TreatmentSchedule();
        newSchedule.end_date = end_date;
        newSchedule.start_date = start_date;
        newSchedule.time_slot = time_slot;
        await scheduleRepository.update(form_id, newSchedule);
        await queryRunner.commitTransaction();
        return res.customSuccess(200, 'Schedule Information successfully updated.', newSchedule);
    }
    catch (err) {
        await queryRunner.rollbackTransaction();
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating Treatment Schedule Information', null, err);
        return next(customError);
    }
    finally {
        await queryRunner.release();
    }
};
exports.editTreatmentSchedule = editTreatmentSchedule;
//# sourceMappingURL=editTreatmentSchedule.js.map