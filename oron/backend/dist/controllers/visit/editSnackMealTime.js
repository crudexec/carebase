"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editSnackMealTime = void 0;
const typeorm_1 = require("typeorm");
const snackMealTime_1 = require("orm/entities/VisitLog/stepTwo/snackMealTime");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editSnackMealTime = async (req, res, next) => {
    try {
        let { ate_all_meal_or_snack, ate_some_meal_or_snack, refused_all_meal_or_snack, drank_a_lot_of_water, drank_some_water, refused_all_water, drank_a_lot_of_juice, drank_some_juice, refused_all_juice, specify_what_snack_or_meal_provided, prepared_snack_or_meal, served_snack_or_meal, assisted_with_feeding, clean_up_after_snack_or_meal, other, specify_other, client_helped_to_clean_up_and_put_away_dishes, snack_meal_time_id, } = req.body;
        const snackMealTimeRepository = (0, typeorm_1.getRepository)(snackMealTime_1.SnackMealTime);
        const formExists = await snackMealTimeRepository.findOne({ where: { id: snack_meal_time_id, deleted_at: null } });
        if (!formExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Snack Meal Time not found`, ['Snack Meal Time not found.']);
            return next(customError);
        }
        ate_all_meal_or_snack = ate_all_meal_or_snack ?? formExists.ate_all_meal_or_snack;
        ate_some_meal_or_snack = ate_some_meal_or_snack ?? formExists.ate_some_meal_or_snack;
        refused_all_meal_or_snack = refused_all_meal_or_snack ?? formExists.refused_all_meal_or_snack;
        drank_a_lot_of_water = drank_a_lot_of_water ?? formExists.drank_a_lot_of_water;
        drank_some_water = drank_some_water ?? formExists.drank_some_water;
        refused_all_water = refused_all_water ?? formExists.refused_all_water;
        drank_a_lot_of_juice = drank_a_lot_of_juice ?? formExists.drank_a_lot_of_juice;
        drank_some_juice = drank_some_juice ?? formExists.drank_some_juice;
        refused_all_juice = refused_all_juice ?? formExists.refused_all_juice;
        specify_what_snack_or_meal_provided =
            specify_what_snack_or_meal_provided ?? formExists.specify_what_snack_or_meal_provided;
        prepared_snack_or_meal = prepared_snack_or_meal ?? formExists.prepared_snack_or_meal;
        served_snack_or_meal = served_snack_or_meal ?? formExists.served_snack_or_meal;
        assisted_with_feeding = assisted_with_feeding ?? formExists.assisted_with_feeding;
        clean_up_after_snack_or_meal = clean_up_after_snack_or_meal ?? formExists.clean_up_after_snack_or_meal;
        other = other ?? formExists.other;
        specify_other = specify_other ?? formExists.specify_other;
        client_helped_to_clean_up_and_put_away_dishes =
            client_helped_to_clean_up_and_put_away_dishes ?? formExists.client_helped_to_clean_up_and_put_away_dishes;
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
        await snackMealTimeRepository.update(snack_meal_time_id, snackMealTime);
        return res.customSuccess(200, 'Snack Meal Time successfully updated.', snackMealTime);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating Snack Meal Time', null, err);
        return next(customError);
    }
};
exports.editSnackMealTime = editSnackMealTime;
//# sourceMappingURL=editSnackMealTime.js.map