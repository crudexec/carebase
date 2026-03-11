"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTreatmentSchedule = void 0;
const typeorm_1 = require("typeorm");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const treatmentSchedule_1 = require("orm/entities/TreatmentPlan/treatmentSchedule");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addTreatmentSchedule = async (req, res, next) => {
    const connection = (0, typeorm_1.getConnection)();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    try {
        await queryRunner.startTransaction();
        const user_id = req.user.id;
        const intake_full_id = req.params.intake_full_id;
        const { end_date, start_date, time_slot, treatment_plan_type, treatment_full_id } = req.body;
        const scheduleRepository = (0, typeorm_1.getRepository)(treatmentSchedule_1.TreatmentSchedule);
        const fullPlanRepository = connection.getRepository(treatmentFullPlan_1.TreatmentFullPlan);
        const newSchedule = new treatmentSchedule_1.TreatmentSchedule();
        newSchedule.registered_by = user_id;
        newSchedule.end_date = end_date;
        newSchedule.start_date = start_date;
        newSchedule.time_slot = time_slot;
        newSchedule.intake_full_id = intake_full_id;
        newSchedule.treatment_plan_type = treatment_plan_type;
        const savedSchedule = await scheduleRepository.save(newSchedule);
        if (!savedSchedule) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Error saving basic schedule information', null, null);
            return next(customError);
        }
        const newFullPlan = new treatmentFullPlan_1.TreatmentFullPlan();
        const alreadyExistFullPlan = await fullPlanRepository.findOne({
            where: { id: treatment_full_id, treatment_plan_type, deleted_at: null },
        });
        if (!alreadyExistFullPlan) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Treatment Plan Not Found', ['Treatment Plan not found']);
            return next(customError);
        }
        newFullPlan.treatment_schedule_id = savedSchedule.id;
        newFullPlan.treatment_plan_type = treatment_plan_type;
        newFullPlan.status = genericEnums_1.Status.DRAFT;
        await fullPlanRepository.update(alreadyExistFullPlan.id, newFullPlan);
        await queryRunner.commitTransaction();
        return res.customSuccess(200, 'Schedule Information successfully created.', savedSchedule);
    }
    catch (err) {
        await queryRunner.rollbackTransaction();
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Treatment Schedule Information', null, err);
        return next(customError);
    }
    finally {
        await queryRunner.release();
    }
};
exports.addTreatmentSchedule = addTreatmentSchedule;
//# sourceMappingURL=addTreatmentSchedule.js.map