"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSnackMealTime = void 0;
const typeorm_1 = require("typeorm");
const snackMealTime_1 = require("orm/entities/VisitLog/stepTwo/snackMealTime");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addSnackMealTime = async (req, res, next) => {
    try {
        const { ate_all_meal_or_snack, ate_some_meal_or_snack, refused_all_meal_or_snack, drank_a_lot_of_water, drank_some_water, refused_all_water, drank_a_lot_of_juice, drank_some_juice, refused_all_juice, specify_what_snack_or_meal_provided, prepared_snack_or_meal, served_snack_or_meal, assisted_with_feeding, clean_up_after_snack_or_meal, other, specify_other, client_helped_to_clean_up_and_put_away_dishes, visit_full_form_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const snackMealTimeRepository = (0, typeorm_1.getRepository)(snackMealTime_1.SnackMealTime);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
            return next(customError);
        }
        const snackMealTime = new snackMealTime_1.SnackMealTime();
        snackMealTime.ate_all_meal_or_snack = ate_all_meal_or_snack;
        snackMealTime.ate_some_meal_or_snack = ate_some_meal_or_snack;
        snackMealTime.refused_all_meal_or_snack = refused_all_meal_or_snack;
        snackMealTime.drank_a_lot_of_water = drank_a_lot_of_water;
        snackMealTime.drank_some_water = drank_some_water;
        snackMealTime.refused_all_water = refused_all_water;
        snackMealTime.drank_a_lot_of_juice = drank_a_lot_of_juice;
        snackMealTime.drank_some_juice = drank_some_juice;
        snackMealTime.refused_all_juice = refused_all_juice;
        snackMealTime.specify_what_snack_or_meal_provided = specify_what_snack_or_meal_provided;
        snackMealTime.prepared_snack_or_meal = prepared_snack_or_meal;
        snackMealTime.served_snack_or_meal = served_snack_or_meal;
        snackMealTime.assisted_with_feeding = assisted_with_feeding;
        snackMealTime.clean_up_after_snack_or_meal = clean_up_after_snack_or_meal;
        snackMealTime.other = other;
        snackMealTime.specify_other = specify_other;
        snackMealTime.client_helped_to_clean_up_and_put_away_dishes = client_helped_to_clean_up_and_put_away_dishes;
        snackMealTime.account_id = account_id;
        snackMealTime.status = genericEnums_1.Status.IN_PROGRESS;
        snackMealTime.registered_by = registered_by;
        snackMealTime.visit_full_form_id = visit_full_form_id;
        const savedSnackMealTime = await snackMealTimeRepository.save(snackMealTime);
        if (savedSnackMealTime) {
            await visitFullFormRepository.update(visit_full_form_id, { snack_meal_time_id: savedSnackMealTime.id });
        }
        return res.customSuccess(200, 'Snack Meal Time successfully added.', savedSnackMealTime);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Snack Meal Time', null, err);
        return next(customError);
    }
};
exports.addSnackMealTime = addSnackMealTime;
//# sourceMappingURL=addSnackMealTime.js.map