"use client";
import { z } from "zod";
import { COUNTRIES, LEVEL_OF_COMPLIANCE, VISITING_INVENTS } from "@/constants";

export const BasicInformationSchema = z.object({
  participant_last_name: z.string().nonempty("Last name is required"),
  participant_first_name: z.string().nonempty("First name is required"),
  participant_age: z.string().nonempty("Age is required"),
  participant_gender: z.enum(["Female", "Male"], {
    errorMap: () => ({ message: "Gender is required" }),
  }),
  date_of_session: z.date({
    required_error: "Date of session is required",
  }),
});

// export const behaviourManagementSchema = z.object({
//   behaviours: z.array(
//     z.object({
//       id: z.string().optional().nullable(),
//       behavior_type: z.string().nonempty("Behaviour type is required"),
//       behavior_description: z
//         .string()
//         .nonempty("Behaviour description is required"),

//       other_specific_description: z.string().optional(),
//       what_time_did_behavior_occur: z
//         .string()
//         .nonempty("Time of behaviour is required"),
//       antecedent: z.string().nonempty("Antecedent is required"),
//       consequence: z.string().nonempty("Consequences are required"),
//       setting: z.string().nonempty("Setting is required"),
//       how_many_times_did_behavior_occur: z
//         .string()
//         .nonempty("Number of times behaviour occurred is required"),
//       for_how_long_did_behavior_occur: z
//         .string()
//         .nonempty("Duration of behaviour is required"),
//       severity: z.string().nonempty("Severity is required"),
//       other_crisis_intervention: z
//         .string()
//         .nonempty("Other crisis intervention is required"),
//     })
//   ),
// });

export const behaviourManagementSchema = z.object({
  behaviours: z.array(
    z
      .object({
        id: z.string().optional().nullable(),
        behavior_type: z.string().nonempty("Behaviour type is required"),
        behavior_description: z
          .string()
          .nonempty("Behaviour description is required"),
        other_specific_description: z.string().optional(),
        what_time_did_behavior_occur: z
          .string()
          .nonempty("Time of behaviour is required"),
        antecedent: z.string().nonempty("Antecedent is required"),
        consequence: z.string().nonempty("Consequences are required"),
        setting: z.string().nonempty("Setting is required"),
        how_many_times_did_behavior_occur: z
          .string()
          .nonempty("Number of times behaviour occurred is required"),
        for_how_long_did_behavior_occur: z
          .string()
          .nonempty("Duration of behaviour is required"),
        severity: z.string().nonempty("Severity is required"),
        other_crisis_intervention: z
          .string()
          .nonempty("Other crisis intervention is required"),
      })
      .superRefine((data, ctx) => {
        if (
          data.behavior_description === "Other, please specify" &&
          !data.other_specific_description
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Other specific description is required when behavior description is 'please specify'",
            path: ["other_specific_description"],
          });
        }
      })
  ),
});
export const communicationSchema = z.object({
  responses: z
    .record(z.boolean())
    .refine(
      (responses) => Object.values(responses).some((value) => value === true),
      {
        message: "At least one response must be selected",
        path: ["responses"],
      }
    ),
  other_description: z.string().optional().nullable(),
});

export const ConcernAndChallengeSchema = z.object({
  was_there_any_concerns_or_challenges: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Challenge response is required" }),
  }),
  describe_circumstances_involved: z.string().optional(),
  supervisor_to_contact_during_session: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Supervisor contact request is required" }),
  }),
});

export const selfManagementSchema = z.object({
  responses: z
    .record(z.boolean())
    .refine(
      (responses) => Object.values(responses).some((value) => value === true),
      {
        message: "At least one option must be selected",
        path: ["responses"],
      }
    ),
  // z.record(z.boolean()),
  other_description: z.string().optional().nullable(),
});

export const SessionHighlightSchema = z.object({
  location: z.string().nonempty("Location is required"),
  level_of_compliance: z.enum(LEVEL_OF_COMPLIANCE as [string, ...string[]], {
    errorMap: () => ({ message: "Level of compliance is required" }),
  }),
  injury_to_self: z.enum(VISITING_INVENTS as [string, ...string[]], {
    errorMap: () => ({ message: "Injury to self is required" }),
  }),
  aggression_to_others: z.string().nonempty("Aggression to others is required"),
  client_hospitalized_in_care_today: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Hospitalization status is required" }),
  }),
  client_placed_themselves_in_harm_by_leaving_my_care: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Danger status is required" }),
  }),
});

export const ThirdFormSchema = z.object({
  forms: z
    .array(
      z.object({
        activityLocation: z.string().min(1, "Please select an activity location"),
        circumstanceLeadingToActivity: z
          .string()
          .min(1, "Please select a circumstance"),
        clientResponse: z.string().min(1, "Please select a client response"),
        consequentlyClient: z.string().min(1, "Please select a consequence"),
        totalTime: z.string().min(1, "Please enter the total time"),
        clientReward: z.string().min(1, "Please select a client reward"),
        additionalComment: z.string().optional(),
        tableData: z.array(z.any()).optional(),
        // grossMotorSkills: z
        //   .array(z.string())
        //   .min(1, "Select at least one gross motor skill"),
        otherGrossMotorSkill: z.string().optional(),
        // fineMotorSkills: z
        //   .array(z.string())
        //   .min(1, "Select at least one fine motor skill"),
        otherFineMotorSkill: z.string().optional(),
      })
    )
    .min(2, "At least 2 goals are required"),
});

export const domesticSkillSchema = z.object({
  other: z.string().optional(),
  chores: z.array(z.string()).min(1, "At least one chore must be selected"),
});

export const leisureSchema = z.object({
  activities: z
    .array(z.string())
    .min(1, "At least one activity must be selected"),
  other: z.string().optional(),
});

export const mealTimeSchema = z.object({
  mealProvided: z.string().optional(),
  other: z.string().optional(),
  clean: z.enum(["yes", "no"]),
  selectedOptions: z
    .array(z.string())
    .min(1, "At least one option must be selected"),
  supportProvided: z
    .array(z.string())
    .min(1, "At least one support option must be selected"),
});

export const personalCareSchema = z.object({
  bathroomIndependence: z.enum(["yes", "no", ""]),
  bathroomAssistance: z.array(z.string()),
  otherBowel: z.string().optional(),
  hygieneSupport: z.array(z.string()),
  otherHygiene: z.string().optional(),
});

export const personalWorkSchema = z
  .object({
    tasks: z.array(z.string()).min(0), // Always an array of strings, can be empty
    other: z.string().optional(), // Keep other optional
    readABook: z.enum(["yes", "no"]),
  })
  .refine(
    (data) => data.tasks.length > 0 || !!data.other, // Ensure tasks has items or other is filled
    {
      message: "At least one task or other field must be filled", // Custom error message
      path: ["tasks"], // Point to the tasks field for the error
    }
  );

export const sensoryNeedsSchema = z.object({
  fineMotorSkills: z
    .array(z.string())
    .min(1, "Select at least one fine motor skill"),
  otherFineMotorSkill: z.string().optional(),
  grossMotorSkills: z
    .array(z.string())
    .min(1, "Select at least one gross motor skill"),
  otherGrossMotorSkill: z.string().optional(),
});

export const socializationSchema = z.object({
  socialSettings: z
    .array(z.string())
    .min(1, "Select at least one social setting"),
  otherSocialSetting: z.string().optional(),
  recreationActivities: z
    .array(z.string())
    .min(1, "Select at least one recreation activity"),
  otherRecreationActivity: z.string().optional(),
  communityIntegration: z
    .array(z.string())
    .min(1, "Select at least one community integration activity"),
  otherCommunityIntegration: z.string().optional(),
});

export const survivalSkillsSchema = z.object({
  skills: z
    .array(z.string())
    .min(1, "At least one safety skill must be selected"),
  other: z.string().optional(),
});

export const utilizationOfMoneySchema = z.object({
  skills: z.array(z.string()).min(1, "At least one skill must be selected"),
  activityLocation: z.string().optional().nullable(),
});

export function validateWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return true;
  } else {
    return false;
  }
}

export function validateSessionHighlight(data: any) {
  if (data) {
    const d = {
      ...data,
      client_hospitalized_in_care_today: data?.client_hospitalized_in_care_today
        ? "yes"
        : "no",

      client_placed_themselves_in_harm_by_leaving_my_care:
        data?.client_placed_themselves_in_harm_by_leaving_my_care
          ? "yes"
          : "no",
    };
    return validateWithSchema(SessionHighlightSchema, d);
  }

  return false;
}

export function validateConcernAndChallenges(data: any) {
  const schema = z
    .object({
      id: z.string().uuid(),
      was_there_any_concerns_or_challenges: z.boolean(),
      supervisor_to_contact_during_session: z.boolean(),
      describe_circumstances_involved: z.string().optional().nullable(),
      treatment_plan_id: z.string().uuid().nullable(),
      status: z.enum(["in_progress", "completed", "pending"]),
      account_id: z.string(),
      visit_full_form_id: z.string().uuid(),
      registered_by: z.string().uuid(),
      created_at: z.string().datetime(),
      updated_at: z.string().datetime(),
      deleted_at: z.string().datetime().nullable(),
    })
    .refine(
      (data) => {
        if (
          data.was_there_any_concerns_or_challenges &&
          !data.describe_circumstances_involved
        ) {
          return false;
        }
        return true;
      },
      {
        message:
          "describe_circumstances_involved should not be empty when was_there_any_concerns_or_challenges is true",
        path: ["describe_circumstances_involved"],
      }
    );

  return validateWithSchema(schema, data);
}

export function validateBehaviourManagement(data: any) {
  const behaviorSchema = z.object({
    id: z.string().uuid(),
    behavior_type: z.string().nonempty("Behavior type cannot be empty"),
    behavior_description: z
      .string()
      .nonempty("Behavior description cannot be empty"),
    what_time_did_behavior_occur: z
      .string()
      .nonempty("Time of behavior occurrence cannot be empty"),
    antecedent: z.string().nonempty("Antecedent cannot be empty"),
    consequence: z.string().nonempty("Consequence cannot be empty"),
    setting: z.string().nonempty("Setting cannot be empty"),
    how_many_times_did_behavior_occur: z
      .string()
      .nonempty("Number of times behavior occurred cannot be empty"),
    for_how_long_did_behavior_occur: z
      .string()
      .nonempty("Duration of behavior occurrence cannot be empty"),
    severity: z.string().nonempty("Severity cannot be empty"),
    other_crisis_intervention: z
      .string()
      .nonempty("Other crisis intervention cannot be empty"),
    treatment_plan_id: z.string().uuid().nullable(),
    visit_full_form_id: z.string().uuid(),
    status: z.enum(["in_progress", "completed", "pending"]),
    account_id: z.string(),
    registered_by: z.string().uuid(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    deleted_at: z.string().datetime().nullable(),
  });

  if (data && Array.isArray(data)) {
    if (data.length < 1) return false;
    const behaviorArraySchema = z.array(behaviorSchema);

    return validateWithSchema(behaviorArraySchema, data);
  }

  return false;
}

export function validateMealTime(data: any) {
  const mealSchema = z
    .object({
      id: z.string().uuid(),
      ate_all_meal_or_snack: z.boolean().optional().nullable(),
      ate_some_meal_or_snack: z.boolean().optional().nullable(),
      refused_all_meal_or_snack: z.boolean().optional().nullable(),
      drank_a_lot_of_water: z.boolean().optional().nullable(),
      drank_some_water: z.boolean().optional().nullable(),
      refused_all_water: z.boolean().optional().nullable(),
      drank_a_lot_of_juice: z.boolean().optional().nullable(),
      drank_some_juice: z.boolean().optional().nullable(),
      refused_all_juice: z.boolean().optional().nullable(),
      specify_what_snack_or_meal_provided: z.string().optional().nullable(),

      prepared_snack_or_meal: z.boolean().optional().nullable(),
      served_snack_or_meal: z.boolean().optional().nullable(),
      assisted_with_feeding: z.boolean().optional().nullable(),
      clean_up_after_snack_or_meal: z.boolean().optional().nullable(),
      other: z.boolean().optional().nullable(),
      specify_other: z.string().nullable(),
      client_helped_to_clean_up_and_put_away_dishes: z
        .boolean()
        .optional()
        .nullable(),
      treatment_plan_id: z.string().uuid().nullable(),
      visit_full_form_id: z.string().uuid(),
      status: z.enum(["in_progress", "completed", "pending"]),
      account_id: z.string(),
      registered_by: z.string().uuid(),
      created_at: z.string().datetime(),
      updated_at: z.string().datetime(),
      deleted_at: z.string().datetime().nullable(),
    })
    .refine(
      (data) => {
        const mealOrDrinkFields = [
          data.ate_all_meal_or_snack,
          data.ate_some_meal_or_snack,
          data.refused_all_meal_or_snack,
          data.drank_a_lot_of_water,
          data.drank_some_water,
          data.refused_all_water,
          data.drank_a_lot_of_juice,
          data.drank_some_juice,
          data.refused_all_juice,
          data.prepared_snack_or_meal,
          data.served_snack_or_meal,
          data.assisted_with_feeding,
          data.clean_up_after_snack_or_meal,
        ];

        const supportField = [
          data.prepared_snack_or_meal,
          data.clean_up_after_snack_or_meal,
          data.assisted_with_feeding,
          data.served_snack_or_meal,
        ];

        return (
          mealOrDrinkFields.some((value) => value === true) &&
          supportField.some((value) => value === true) &&
          typeof data.client_helped_to_clean_up_and_put_away_dishes ===
            "boolean"
        );
      },
      {
        message:
          "At least one of the meal, drink, preparation, or assistance related fields must be true",
        path: [
          "ate_all_meal_or_snack",
          "ate_some_meal_or_snack",
          "refused_all_meal_or_snack",
          "drank_a_lot_of_water",
          "drank_some_water",
          "refused_all_water",
          "drank_a_lot_of_juice",
          "drank_some_juice",
          "refused_all_juice",
          "prepared_snack_or_meal",
          "served_snack_or_meal",
          "assisted_with_feeding",
          "clean_up_after_snack_or_meal",
        ],
      }
    );

  return validateWithSchema(mealSchema, data);
}

export function validatePersonalWork(data: any) {
  const educationSchema = z
    .object({
      id: z.string().uuid().nullable(),
      grammar: z.boolean().nullable(),
      writing_skills: z.boolean().nullable(),
      vocabulary: z.boolean().nullable(),
      reading_comprehension: z.boolean().nullable(),
      algebra: z.boolean().nullable(),
      geometry: z.boolean().nullable(),
      measurement: z.boolean().nullable(),
      number_operations: z.boolean().nullable(),
      other: z.boolean().nullable(),
      other_specify: z.string().nullable(),
      i_read_a_book_to_client: z.boolean(),
      status: z.enum(["in_progress", "completed", "pending"]).nullable(),
      account_id: z.string().nullable(),
      treatment_plan_id: z.string().uuid().nullable(),
      visit_full_form_id: z.string().uuid().nullable(),
      registered_by: z.string().uuid(),
      created_at: z.string().datetime().nullable(),
      updated_at: z.string().datetime().nullable(),
      deleted_at: z.string().datetime().nullable(),
    })
    .refine((data) => {
      const engagedList = [
        data.grammar,
        data.algebra,
        data.vocabulary,
        data.measurement,
        data.writing_skills,
        data.reading_comprehension,
        data.geometry,
        data.number_operations,
      ];

      return (
        engagedList.some((value) => value === true) &&
        typeof data.i_read_a_book_to_client === "boolean"
      );
    });
  const e = validateWithSchema(educationSchema, data);

  return e;
}

export function validatePersonalCare(data: any) {
  const hygieneSchema = z.object({
    id: z.string().uuid(),
    client_name_used_bathroom_without_assistance: z.boolean(),
    assisted_client_with_changing_diapers: z.boolean().nullable(),
    assisted_client_with_toileting: z.boolean().nullable(),
    other_bowel: z.boolean().nullable(),
    other_specify_bowel: z.string().nullable(),
    supported_client_with_shampooing: z.boolean().nullable(),
    supported_client_with_brushing_teeth: z.boolean().nullable(),
    supported_client_with_bathing: z.boolean().nullable(),
    supported_client_with_toweling: z.boolean().nullable(),
    supported_client_with_showering: z.boolean().nullable(),
    supported_client_with_menstrual_care: z.boolean().nullable(),
    other_personal_hygiene: z.boolean().nullable(),
    other_specify_personal_hygiene: z.string().nullable(),
    status: z.enum(["in_progress", "completed", "pending"]),
    account_id: z.string(),
    treatment_plan_id: z.string().uuid().nullable(),
    visit_full_form_id: z.string().uuid(),
    registered_by: z.string().uuid(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    deleted_at: z.string().datetime().nullable(),
  });

  return validateWithSchema(hygieneSchema, data);
}

export function validateSensoryNeeds(data: any) {
  const motorDevelopmentSchema = z
    .object({
      id: z.string().uuid(),
      paste_objects: z.boolean().nullable(),
      copy_simple_shapes: z.boolean().nullable(),
      turn_pages_of_book: z.boolean().nullable(),
      button_a_shirt: z.boolean().nullable(),
      use_of_cutlery: z.boolean().nullable(),
      cut_simple_shapes: z.boolean().nullable(),
      use_pencil_and_crayons_well: z.boolean().nullable(),
      zip_a_zipper: z.boolean().nullable(),
      handle_scissors_well: z.boolean().nullable(),
      play_musical_instruments: z.boolean().nullable(),
      match_simple_objects: z.boolean().nullable(),
      complete_simple_puzzles: z.boolean().nullable(),
      build_with_blocks: z.boolean().nullable(),
      other_error_motor_development_skills: z.boolean().nullable(),
      other_error_specify_motor_development_skills: z.string().nullable(),
      throw_a_ball: z.boolean().nullable(),
      kick_using_balls: z.boolean().nullable(),
      roll_balls_with_hand_or_foot: z.boolean().nullable(),
      skip_in_circles: z.boolean().nullable(),
      hang_clothes: z.boolean().nullable(),
      go_down_slides: z.boolean().nullable(),
      climb_ladders: z.boolean().nullable(),
      walk_a_straight_line: z.boolean().nullable(),
      jump_rope: z.boolean().nullable(),
      run_around_objects: z.boolean().nullable(),
      toss_a_ball: z.boolean().nullable(),
      walk_backwards: z.boolean().nullable(),
      balance_on_one_foot: z.boolean().nullable(),
      going_up_and_down_steps: z.boolean().nullable(),
      pump_legs_on_the_swing_at_a_playground: z.boolean().nullable(),
      other_gross_motor_skills: z.boolean().nullable(),
      other_specify_gross_motor_skills: z.string().nullable(),
      status: z.enum(["in_progress", "completed", "pending"]),
      account_id: z.string(),
      treatment_plan_id: z.string().uuid().nullable(),
      visit_full_form_id: z.string().uuid(),
      registered_by: z.string().uuid(),
      created_at: z.string().datetime(),
      updated_at: z.string().datetime(),
      deleted_at: z.string().datetime().nullable(),
    })
    .refine((data) => {
      const engagedList = [
        data.paste_objects,
        data.button_a_shirt,
        data.use_pencil_and_crayons_well,
        data.play_musical_instruments,
        data.build_with_blocks,
        data.copy_simple_shapes,
        data.use_of_cutlery,
        data.zip_a_zipper,
        data.match_simple_objects,
        data.turn_pages_of_book,
        data.cut_simple_shapes,
        data.handle_scissors_well,
        data.complete_simple_puzzles,
      ];
      const hyg = [
        data.throw_a_ball,
        data.skip_in_circles,
        data.climb_ladders,
        data.run_around_objects,
        data.balance_on_one_foot,
        data.kick_using_balls,
        data.hang_clothes,
        data.walk_a_straight_line,
        data.toss_a_ball,
        data.going_up_and_down_steps,
        data.roll_balls_with_hand_or_foot,
        data.go_down_slides,
        data.jump_rope,
        data.walk_backwards,
        data.pump_legs_on_the_swing_at_a_playground,
      ];

      return (
        engagedList.some((value) => value === true) &&
        hyg.some((value) => value === true)
      );
    });

  return validateWithSchema(motorDevelopmentSchema, data);
}

export function validateSocialization(data: any) {
  const socialActivitySchema = z
    .object({
      id: z.string().uuid(),
      birthday_party: z.boolean().nullable(),
      communication_session: z.boolean().nullable(),
      social_group: z.boolean().nullable(),
      music_dance_group: z.boolean().nullable(),
      other_social_setting: z.boolean().nullable(),
      specify_other_social_setting: z.string().nullable(),
      play_at_the_park: z.boolean().nullable(),
      basketball: z.boolean().nullable(),
      watch_movie: z.boolean().nullable(),
      bowling: z.boolean().nullable(),
      swimming: z.boolean().nullable(),
      other_recreation: z.boolean().nullable(),
      specify_other_recreation: z.string().nullable(),
      visit_to_the_library: z.boolean().nullable(),
      visit_to_the_museum: z.boolean().nullable(),
      visit_to_the_zoo: z.boolean().nullable(),
      visit_to_the_shopping_mall: z.boolean().nullable(),
      visit_to_the_post_office: z.boolean().nullable(),
      other_community_integration: z.boolean().nullable(),
      specify_other_community_integration: z.string().nullable(),
      status: z.enum(["in_progress", "completed", "pending"]),
      account_id: z.string(),
      treatment_plan_id: z.string().uuid().nullable(),
      visit_full_form_id: z.string().uuid(),
      registered_by: z.string().uuid(),
      created_at: z.string().datetime(),
      updated_at: z.string().datetime(),
      deleted_at: z.string().datetime().nullable(),
    })
    .refine((data) => {
      const engagedList = [
        data.birthday_party,
        data.social_group,
        data.communication_session,
        data.music_dance_group,
        data.other_social_setting,
      ];
      const hyg = [
        data.play_at_the_park,
        data.watch_movie,
        data.swimming,
        data.basketball,
        data.bowling,
        data.other_recreation,
      ];

      const red = [
        data.visit_to_the_library,
        data.visit_to_the_zoo,
        data.visit_to_the_museum,
        data.visit_to_the_shopping_mall,
        data.visit_to_the_post_office,
        data.other_community_integration,
      ];

      return (
        engagedList.some((value) => value === true) &&
        hyg.some((value) => value === true) &&
        red.some((value) => value === true)
      );
    });

  return validateWithSchema(socialActivitySchema, data);
}

export function validateUtilization(data: any) {
  const activitySchema = z
    .object({
      id: z.string().uuid(),
      handing_bills_to_cashier: z.boolean().nullable(),
      waiting_for_and_receiving_debit_credit_card: z.boolean().nullable(),
      handing_coins_to_cashier: z.boolean().nullable(),
      counting_the_change_to_make_sure_it_is_correct: z.boolean().nullable(),
      handing_debit_credit_card_to_cashier: z.boolean().nullable(),
      determining_and_handling_the_correct_estimated_amount: z
        .boolean()
        .nullable(),
      using_the_dollar_up_program: z.boolean().nullable(),
      obtaining_and_reviewing_receipt_for_accuracy: z.boolean().nullable(),
      waiting_for_and_accepting_the_change: z.boolean().nullable(),
      this_activity_occured_at: z.string(),
      status: z.enum(["in_progress", "completed", "pending"]),
      account_id: z.string().nullable(),
      treatment_plan_id: z.string().uuid().nullable(),
      visit_full_form_id: z.string().uuid(),
      registered_by: z.string().uuid(),
      created_at: z.string().datetime(),
      updated_at: z.string().datetime(),
      deleted_at: z.string().datetime().nullable(),
    })
    .refine((data) => {
      const engagedList = [
        data.handing_bills_to_cashier,
        data.waiting_for_and_receiving_debit_credit_card,
        data.handing_coins_to_cashier,
        data.counting_the_change_to_make_sure_it_is_correct,
        data.handing_debit_credit_card_to_cashier,
        data.determining_and_handling_the_correct_estimated_amount,
        data.using_the_dollar_up_program,
        data.obtaining_and_reviewing_receipt_for_accuracy,
        data.waiting_for_and_accepting_the_change,
      ];

      return (
        engagedList.some((value) => value === true) &&
        data.this_activity_occured_at
      );
    });

  return validateWithSchema(activitySchema, data);
}
