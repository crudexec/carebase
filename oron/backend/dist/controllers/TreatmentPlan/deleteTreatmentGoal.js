"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTreatmentGoal = void 0;
const typeorm_1 = require("typeorm");
const treatmentGoal_1 = require("orm/entities/TreatmentPlan/treatmentGoal");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const deleteTreatmentGoal = async (req, res, next) => {
    try {
        const goal_id = req.params.goal_id;
        const goalRepository = (0, typeorm_1.getRepository)(treatmentGoal_1.TreatmentGoal);
        const goal = await goalRepository.findOne({
            where: { id: goal_id },
        });
        if (!goal) {
            const customError = new CustomError_1.CustomError(404, 'General', `Goal Information not found`, [
                'Goal Information not found.',
            ]);
            return next(customError);
        }
        await goalRepository.softDelete({ id: goal_id });
        return res.customSuccess(200, 'Treatment Goal Information successfully deleted.', null);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Treatment Goal Information', null, err);
        return next(customError);
    }
};
exports.deleteTreatmentGoal = deleteTreatmentGoal;
//# sourceMappingURL=deleteTreatmentGoal.js.map