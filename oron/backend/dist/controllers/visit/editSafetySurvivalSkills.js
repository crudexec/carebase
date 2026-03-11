"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editSafetySurvivalSkills = void 0;
const typeorm_1 = require("typeorm");
const safetyAndSurvivalSkills_1 = require("orm/entities/VisitLog/stepTwo/safetyAndSurvivalSkills");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editSafetySurvivalSkills = async (req, res, next) => {
    try {
        let { cross_the_street, awareness_of_strangers, fire_emergency_awareness, unlock_door_when_trapped_in_a_room, other, specify_other, safety_and_survival_skills_id, } = req.body;
        const safetyAndSurvivalSkillsRepository = (0, typeorm_1.getRepository)(safetyAndSurvivalSkills_1.SafetyAndSurvivalSkills);
        const safetyAndSurvivalSkillsExists = await safetyAndSurvivalSkillsRepository.findOne({
            where: { id: safety_and_survival_skills_id, deleted_at: null },
        });
        if (!safetyAndSurvivalSkillsExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Safety and Survival Skills not found`, [
                'Safety and Survival Skills not found.',
            ]);
            return next(customError);
        }
        cross_the_street = cross_the_street ?? safetyAndSurvivalSkillsExists.cross_the_street;
        awareness_of_strangers = awareness_of_strangers ?? safetyAndSurvivalSkillsExists.awareness_of_strangers;
        fire_emergency_awareness = fire_emergency_awareness ?? safetyAndSurvivalSkillsExists.fire_emergency_awareness;
        unlock_door_when_trapped_in_a_room =
            unlock_door_when_trapped_in_a_room ?? safetyAndSurvivalSkillsExists.unlock_door_when_trapped_in_a_room;
        other = other ?? safetyAndSurvivalSkillsExists.other;
        specify_other = specify_other ?? safetyAndSurvivalSkillsExists.specify_other;
        const safetyAndSurvivalSkills = new safetyAndSurvivalSkills_1.SafetyAndSurvivalSkills();
        safetyAndSurvivalSkills.cross_the_street = cross_the_street;
        safetyAndSurvivalSkills.awareness_of_strangers = awareness_of_strangers;
        safetyAndSurvivalSkills.fire_emergency_awareness = fire_emergency_awareness;
        safetyAndSurvivalSkills.unlock_door_when_trapped_in_a_room = unlock_door_when_trapped_in_a_room;
        safetyAndSurvivalSkills.other = other;
        safetyAndSurvivalSkills.specify_other = specify_other;
        await safetyAndSurvivalSkillsRepository.update(safety_and_survival_skills_id, safetyAndSurvivalSkills);
        return res.customSuccess(200, 'Safety and Survival Skills successfully updated.', safetyAndSurvivalSkills);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating Safety and Survival Skills', null, err);
        return next(customError);
    }
};
exports.editSafetySurvivalSkills = editSafetySurvivalSkills;
//# sourceMappingURL=editSafetySurvivalSkills.js.map