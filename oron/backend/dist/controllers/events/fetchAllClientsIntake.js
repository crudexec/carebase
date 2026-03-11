"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllClientsIntake = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fetchAllClientsIntake = async (req, res, next) => {
    try {
        const account_id = req.user.account_id;
        const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const treatmentFullPlanRepository = (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const intakeDataArray = [];
        const intakes = await intakeFullFormRepository.find({ where: { account_id, deleted_at: null } });
        let temp = {};
        for (const intake of intakes) {
            const treatmentPlan = await treatmentFullPlanRepository.findOne({
                where: { intake_full_id: intake.id, deleted_at: null },
            });
            if (treatmentPlan) {
                temp = { ...intake, treatment_plan_exists: true };
            }
            else {
                temp = { ...intake, treatment_plan_exists: false };
            }
            intakeDataArray.push(temp);
        }
        return res.customSuccess(200, 'Clients Intake Retrieved Successfully', intakeDataArray);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Retrieving Intakes', null, err);
        return next(customError);
    }
};
exports.fetchAllClientsIntake = fetchAllClientsIntake;
//# sourceMappingURL=fetchAllClientsIntake.js.map