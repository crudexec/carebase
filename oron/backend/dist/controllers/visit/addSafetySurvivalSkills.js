"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSafetySurvivalSkills = void 0;
const typeorm_1 = require("typeorm");
const safetyAndSurvivalSkills_1 = require("orm/entities/VisitLog/stepTwo/safetyAndSurvivalSkills");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addSafetySurvivalSkills = async (req, res, next) => {
    try {
        const { cross_the_street, awareness_of_strangers, fire_emergency_awareness, unlock_door_when_trapped_in_a_room, other, specify_other, visit_full_form_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const safetyAndSurvivalSkillsRepository = (0, typeorm_1.getRepository)(safetyAndSurvivalSkills_1.SafetyAndSurvivalSkills);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
            return next(customError);
        }
        const safetyAndSurvivalSkills = new safetyAndSurvivalSkills_1.SafetyAndSurvivalSkills();
        safetyAndSurvivalSkills.cross_the_street = cross_the_street;
        safetyAndSurvivalSkills.awareness_of_strangers = awareness_of_strangers;
        safetyAndSurvivalSkills.fire_emergency_awareness = fire_emergency_awareness;
        safetyAndSurvivalSkills.unlock_door_when_trapped_in_a_room = unlock_door_when_trapped_in_a_room;
        safetyAndSurvivalSkills.other = other;
        safetyAndSurvivalSkills.specify_other = specify_other;
        safetyAndSurvivalSkills.account_id = account_id;
        safetyAndSurvivalSkills.status = genericEnums_1.Status.IN_PROGRESS;
        safetyAndSurvivalSkills.registered_by = registered_by;
        safetyAndSurvivalSkills.visit_full_form_id = visit_full_form_id;
        const savedSafetyAndSurvivalSkills = await safetyAndSurvivalSkillsRepository.save(safetyAndSurvivalSkills);
        if (savedSafetyAndSurvivalSkills) {
            await visitFullFormRepository.update(visit_full_form_id, {
                safety_and_survival_skills_id: savedSafetyAndSurvivalSkills.id,
            });
        }
        return res.customSuccess(200, 'Safety and Survival Skills successfully added.', savedSafetyAndSurvivalSkills);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Safety and Survival Skills', null, err);
        return next(customError);
    }
};
exports.addSafetySurvivalSkills = addSafetySurvivalSkills;
//# sourceMappingURL=addSafetySurvivalSkills.js.map