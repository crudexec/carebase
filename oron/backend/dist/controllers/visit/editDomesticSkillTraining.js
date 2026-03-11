"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editDomesticSkillTraining = void 0;
const typeorm_1 = require("typeorm");
const domesticSkillTraining_1 = require("orm/entities/VisitLog/stepTwo/domesticSkillTraining");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editDomesticSkillTraining = async (req, res, next) => {
    try {
        let { assist_to_make_bed, assist_to_dust_furniture, assist_to_vacuum, assist_to_arrange_clothes, assist_to_laundry, assist_to_do_dishes, assist_to_remove_trash, assist_to_fold_clothes, other, specify_other, assist_to_arrange_chairs, assist_to_arrange_tables, assist_to_turn_off_light, assist_to_turn_off_computer, assist_to_arrange_bookshelves, domestic_skill_training_id, } = req.body;
        const domesticSkillTrainingRepository = (0, typeorm_1.getRepository)(domesticSkillTraining_1.DomesticSkillTraining);
        const domesticSkillTrainingExists = await domesticSkillTrainingRepository.findOne({
            where: { id: domestic_skill_training_id, deleted_at: null },
        });
        if (!domesticSkillTrainingExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Domestic Skill Training not found`, [
                'Domestic Skill Training not found.',
            ]);
            return next(customError);
        }
        assist_to_make_bed = assist_to_make_bed ?? domesticSkillTrainingExists.assist_to_make_bed;
        assist_to_dust_furniture = assist_to_dust_furniture ?? domesticSkillTrainingExists.assist_to_dust_furniture;
        assist_to_vacuum = assist_to_vacuum ?? domesticSkillTrainingExists.assist_to_vacuum;
        assist_to_arrange_clothes = assist_to_arrange_clothes ?? domesticSkillTrainingExists.assist_to_arrange_clothes;
        assist_to_laundry = assist_to_laundry ?? domesticSkillTrainingExists.assist_to_laundry;
        assist_to_do_dishes = assist_to_do_dishes ?? domesticSkillTrainingExists.assist_to_do_dishes;
        assist_to_remove_trash = assist_to_remove_trash ?? domesticSkillTrainingExists.assist_to_remove_trash;
        assist_to_fold_clothes = assist_to_fold_clothes ?? domesticSkillTrainingExists.assist_to_fold_clothes;
        other = other ?? domesticSkillTrainingExists.other;
        specify_other = specify_other ?? domesticSkillTrainingExists.specify_other;
        assist_to_arrange_chairs = assist_to_arrange_chairs ?? domesticSkillTrainingExists.assist_to_arrange_chairs;
        assist_to_arrange_tables = assist_to_arrange_tables ?? domesticSkillTrainingExists.assist_to_arrange_tables;
        assist_to_turn_off_light = assist_to_turn_off_light ?? domesticSkillTrainingExists.assist_to_turn_off_light;
        assist_to_turn_off_computer =
            assist_to_turn_off_computer ?? domesticSkillTrainingExists.assist_to_turn_off_computer;
        assist_to_arrange_bookshelves =
            assist_to_arrange_bookshelves ?? domesticSkillTrainingExists.assist_to_arrange_bookshelves;
        const domesticSkillTraining = new domesticSkillTraining_1.DomesticSkillTraining();
        domesticSkillTraining.assist_to_make_bed = assist_to_make_bed;
        domesticSkillTraining.assist_to_dust_furniture = assist_to_dust_furniture;
        domesticSkillTraining.assist_to_vacuum = assist_to_vacuum;
        domesticSkillTraining.assist_to_arrange_clothes = assist_to_arrange_clothes;
        domesticSkillTraining.assist_to_laundry = assist_to_laundry;
        domesticSkillTraining.assist_to_do_dishes = assist_to_do_dishes;
        domesticSkillTraining.assist_to_remove_trash = assist_to_remove_trash;
        domesticSkillTraining.assist_to_fold_clothes = assist_to_fold_clothes;
        domesticSkillTraining.other = other;
        domesticSkillTraining.specify_other = specify_other;
        domesticSkillTraining.assist_to_arrange_chairs = assist_to_arrange_chairs;
        domesticSkillTraining.assist_to_arrange_tables = assist_to_arrange_tables;
        domesticSkillTraining.assist_to_turn_off_light = assist_to_turn_off_light;
        domesticSkillTraining.assist_to_turn_off_computer = assist_to_turn_off_computer;
        domesticSkillTraining.assist_to_arrange_bookshelves = assist_to_arrange_bookshelves;
        await domesticSkillTrainingRepository.update(domestic_skill_training_id, domesticSkillTraining);
        return res.customSuccess(200, 'Domestic Skill Training successfully updated.', domesticSkillTraining);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating Domestic Skill Training', null, err);
        return next(customError);
    }
};
exports.editDomesticSkillTraining = editDomesticSkillTraining;
//# sourceMappingURL=editDomesticSkillTraining.js.map