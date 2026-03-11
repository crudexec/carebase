"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editSensoryNeedsAndMotorDevelopment = void 0;
const typeorm_1 = require("typeorm");
const sensoryNeedAndMotorDevelopment_1 = require("orm/entities/VisitLog/stepTwo/sensoryNeedAndMotorDevelopment");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editSensoryNeedsAndMotorDevelopment = async (req, res, next) => {
    try {
        let { paste_objects, copy_simple_shapes, turn_pages_of_book, button_a_shirt, use_of_cutlery, cut_simple_shapes, use_pencil_and_crayons_well, zip_a_zipper, handle_scissors_well, play_musical_instruments, match_simple_objects, complete_simple_puzzles, build_with_blocks, other_error_motor_development_skills, other_error_specify_motor_development_skills, throw_a_ball, kick_using_balls, roll_balls_with_hand_or_foot, skip_in_circles, hang_clothes, go_down_slides, climb_ladders, walk_a_straight_line, jump_rope, run_around_objects, toss_a_ball, walk_backwards, balance_on_one_foot, going_up_and_down_steps, pump_legs_on_the_swing_at_a_playground, other_gross_motor_skills, other_specify_gross_motor_skills, sensory_need_and_motor_development_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const sensoryNeedsAndMotorDevelopmentRepository = (0, typeorm_1.getRepository)(sensoryNeedAndMotorDevelopment_1.SensoryNeedAndMotorDevelopment);
        const formExists = await sensoryNeedsAndMotorDevelopmentRepository.findOne({
            where: { id: sensory_need_and_motor_development_id, deleted_at: null },
        });
        if (!formExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Sensory Needs and Motor Development not found`, [
                'Sensory Needs and Motor Development not found.',
            ]);
            return next(customError);
        }
        paste_objects = paste_objects ?? formExists.paste_objects;
        copy_simple_shapes = copy_simple_shapes ?? formExists.copy_simple_shapes;
        turn_pages_of_book = turn_pages_of_book ?? formExists.turn_pages_of_book;
        button_a_shirt = button_a_shirt ?? formExists.button_a_shirt;
        use_of_cutlery = use_of_cutlery ?? formExists.use_of_cutlery;
        cut_simple_shapes = cut_simple_shapes ?? formExists.cut_simple_shapes;
        use_pencil_and_crayons_well = use_pencil_and_crayons_well ?? formExists.use_pencil_and_crayons_well;
        zip_a_zipper = zip_a_zipper ?? formExists.zip_a_zipper;
        handle_scissors_well = handle_scissors_well ?? formExists.handle_scissors_well;
        play_musical_instruments = play_musical_instruments ?? formExists.play_musical_instruments;
        match_simple_objects = match_simple_objects ?? formExists.match_simple_objects;
        complete_simple_puzzles = complete_simple_puzzles ?? formExists.complete_simple_puzzles;
        build_with_blocks = build_with_blocks ?? formExists.build_with_blocks;
        other_error_motor_development_skills =
            other_error_motor_development_skills ?? formExists.other_error_motor_development_skills;
        other_error_specify_motor_development_skills =
            other_error_specify_motor_development_skills ?? formExists.other_error_specify_motor_development_skills;
        throw_a_ball = throw_a_ball ?? formExists.throw_a_ball;
        kick_using_balls = kick_using_balls ?? formExists.kick_using_balls;
        roll_balls_with_hand_or_foot = roll_balls_with_hand_or_foot ?? formExists.roll_balls_with_hand_or_foot;
        skip_in_circles = skip_in_circles ?? formExists.skip_in_circles;
        hang_clothes = hang_clothes ?? formExists.hang_clothes;
        go_down_slides = go_down_slides ?? formExists.go_down_slides;
        climb_ladders = climb_ladders ?? formExists.climb_ladders;
        walk_a_straight_line = walk_a_straight_line ?? formExists.walk_a_straight_line;
        jump_rope = jump_rope ?? formExists.jump_rope;
        run_around_objects = run_around_objects ?? formExists.run_around_objects;
        toss_a_ball = toss_a_ball ?? formExists.toss_a_ball;
        walk_backwards = walk_backwards ?? formExists.walk_backwards;
        balance_on_one_foot = balance_on_one_foot ?? formExists.balance_on_one_foot;
        going_up_and_down_steps = going_up_and_down_steps ?? formExists.going_up_and_down_steps;
        pump_legs_on_the_swing_at_a_playground =
            pump_legs_on_the_swing_at_a_playground ?? formExists.pump_legs_on_the_swing_at_a_playground;
        other_gross_motor_skills = other_gross_motor_skills ?? formExists.other_gross_motor_skills;
        other_specify_gross_motor_skills = other_specify_gross_motor_skills ?? formExists.other_specify_gross_motor_skills;
        const sensoryNeedsAndMotorDevelopment = new sensoryNeedAndMotorDevelopment_1.SensoryNeedAndMotorDevelopment();
        sensoryNeedsAndMotorDevelopment.paste_objects = paste_objects;
        sensoryNeedsAndMotorDevelopment.copy_simple_shapes = copy_simple_shapes;
        sensoryNeedsAndMotorDevelopment.turn_pages_of_book = turn_pages_of_book;
        sensoryNeedsAndMotorDevelopment.button_a_shirt = button_a_shirt;
        sensoryNeedsAndMotorDevelopment.use_of_cutlery = use_of_cutlery;
        sensoryNeedsAndMotorDevelopment.cut_simple_shapes = cut_simple_shapes;
        sensoryNeedsAndMotorDevelopment.use_pencil_and_crayons_well = use_pencil_and_crayons_well;
        sensoryNeedsAndMotorDevelopment.zip_a_zipper = zip_a_zipper;
        sensoryNeedsAndMotorDevelopment.handle_scissors_well = handle_scissors_well;
        sensoryNeedsAndMotorDevelopment.play_musical_instruments = play_musical_instruments;
        sensoryNeedsAndMotorDevelopment.match_simple_objects = match_simple_objects;
        sensoryNeedsAndMotorDevelopment.complete_simple_puzzles = complete_simple_puzzles;
        sensoryNeedsAndMotorDevelopment.build_with_blocks = build_with_blocks;
        sensoryNeedsAndMotorDevelopment.other_error_motor_development_skills = other_error_motor_development_skills;
        sensoryNeedsAndMotorDevelopment.other_error_specify_motor_development_skills =
            other_error_specify_motor_development_skills;
        sensoryNeedsAndMotorDevelopment.throw_a_ball = throw_a_ball;
        sensoryNeedsAndMotorDevelopment.kick_using_balls = kick_using_balls;
        sensoryNeedsAndMotorDevelopment.roll_balls_with_hand_or_foot = roll_balls_with_hand_or_foot;
        sensoryNeedsAndMotorDevelopment.skip_in_circles = skip_in_circles;
        sensoryNeedsAndMotorDevelopment.hang_clothes = hang_clothes;
        sensoryNeedsAndMotorDevelopment.go_down_slides = go_down_slides;
        sensoryNeedsAndMotorDevelopment.climb_ladders = climb_ladders;
        sensoryNeedsAndMotorDevelopment.walk_a_straight_line = walk_a_straight_line;
        sensoryNeedsAndMotorDevelopment.jump_rope = jump_rope;
        sensoryNeedsAndMotorDevelopment.run_around_objects = run_around_objects;
        sensoryNeedsAndMotorDevelopment.toss_a_ball = toss_a_ball;
        sensoryNeedsAndMotorDevelopment.walk_backwards = walk_backwards;
        sensoryNeedsAndMotorDevelopment.balance_on_one_foot = balance_on_one_foot;
        sensoryNeedsAndMotorDevelopment.going_up_and_down_steps = going_up_and_down_steps;
        sensoryNeedsAndMotorDevelopment.pump_legs_on_the_swing_at_a_playground = pump_legs_on_the_swing_at_a_playground;
        sensoryNeedsAndMotorDevelopment.other_gross_motor_skills = other_gross_motor_skills;
        sensoryNeedsAndMotorDevelopment.other_specify_gross_motor_skills = other_specify_gross_motor_skills;
        await sensoryNeedsAndMotorDevelopmentRepository.update(sensory_need_and_motor_development_id, sensoryNeedsAndMotorDevelopment);
        return res.customSuccess(200, 'Sensory Needs and Motor Development successfully updated.', sensoryNeedsAndMotorDevelopment);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating Sensory Needs and Motor Development', null, err);
        return next(customError);
    }
};
exports.editSensoryNeedsAndMotorDevelopment = editSensoryNeedsAndMotorDevelopment;
//# sourceMappingURL=editSensoryNeedsDevelopment.js.map