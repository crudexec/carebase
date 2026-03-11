"use client";

import React, { useEffect } from "react";
import { useForm, Controller, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FormInput from "@/components/input-fields/FormInput";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  checkFormData,
  convertMealTimeData,
  getErrorMessage,
} from "@/utils/helpers";
import useVisitingFormSubmission from "../../logic";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { mealTimeSchema } from "../../logic/schema";
import { toast } from "@/components/ui/use-toast";

type MealTimeFormData = z.infer<typeof mealTimeSchema>;

interface MealTimeProps {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  admin?: boolean;
}

interface MealTimeData {
  id?: string;
  ate_all_meal_or_snack: boolean | null;
  ate_some_meal_or_snack: boolean | null;
  refused_all_meal_or_snack: boolean | null;
  drank_a_lot_of_water: boolean | null;
  drank_some_water: boolean | null;
  refused_all_water: boolean | null;
  drank_a_lot_of_juice: boolean | null;
  drank_some_juice: boolean | null;
  refused_all_juice: boolean | null;
  specify_what_snack_or_meal_provided: string | null;
  prepared_snack_or_meal: boolean | null;
  served_snack_or_meal: boolean | null;
  assisted_with_feeding: boolean | null;
  clean_up_after_snack_or_meal: boolean | null;
  other: boolean | null;
  specify_other: string | null;
  none?: string;
  S_none?: string;
  client_helped_to_clean_up_and_put_away_dishes: boolean | null;
}

const options = [
  { label: "Ate all the meal/snack", value: "ate_all_meal_or_snack" },
  { label: "Drank a lot of water", value: "drank_a_lot_of_water" },
  { label: "Drank a lot of juice", value: "drank_a_lot_of_juice" },
  { label: "Ate some of the meal/snack", value: "ate_some_meal_or_snack" },
  { label: "Drank some water", value: "drank_some_water" },
  { label: "Drank some juice", value: "drank_some_juice" },
  { label: "Didn't eat the meal/snack", value: "refused_all_meal_or_snack" },
  { label: "Drank no water", value: "refused_all_water" },
  { label: "Drank no juice", value: "refused_all_juice" },
  { label: "None of the above", value: "none" },
];

const supportOptions = [
  { label: "Prepare snack/meal", value: "prepared_snack_or_meal" },
  { label: "Clean up after snack/meal", value: "clean_up_after_snack_or_meal" },
  { label: "Served snack/meal", value: "served_snack_or_meal" },
  { label: "Assisted with feeding", value: "assisted_with_feeding" },
  { label: "Other", value: "other" },
  { label: "None of the above", value: "S_none" },
];

const populateMealTimeForm = (
  data: Partial<MealTimeData>,
  setValue: UseFormSetValue<MealTimeFormData>
) => {
  const selectedOptions = [
    { field: "ate_all_meal_or_snack", value: "ate_all_meal_or_snack" },
    { field: "ate_some_meal_or_snack", value: "ate_some_meal_or_snack" },
    { field: "refused_all_meal_or_snack", value: "refused_all_meal_or_snack" },
    { field: "drank_a_lot_of_water", value: "drank_a_lot_of_water" },
    { field: "drank_some_water", value: "drank_some_water" },
    { field: "refused_all_water", value: "refused_all_water" },
    { field: "drank_a_lot_of_juice", value: "drank_a_lot_of_juice" },
    { field: "drank_some_juice", value: "drank_some_juice" },
    { field: "refused_all_juice", value: "refused_all_juice" },
  ]
    .filter((option) => data[option.field as keyof MealTimeData] === true)
    .map((option) => option.value);

  if (data?.id) {
    if (checkFormData(data, options) === false || data.none) {
      setValue("selectedOptions", ["none"]);
    }

    if (checkFormData(data, supportOptions) === false || data.S_none) {
      setValue("supportProvided", ["S_none"]);
    }
  }
  if (selectedOptions.length > 0) {
    setValue("selectedOptions", selectedOptions);
  }

  if (data.specify_what_snack_or_meal_provided) {
    setValue("mealProvided", data.specify_what_snack_or_meal_provided);
  }

  const supportProvided = [
    { field: "prepared_snack_or_meal", value: "prepared_snack_or_meal" },
    { field: "served_snack_or_meal", value: "served_snack_or_meal" },
    { field: "assisted_with_feeding", value: "assisted_with_feeding" },
    {
      field: "clean_up_after_snack_or_meal",
      value: "clean_up_after_snack_or_meal",
    },
    { field: "other", value: "other" },
  ]
    .filter((option) => data[option.field as keyof MealTimeData] === true)
    .map((option) => option.value);

  if (supportProvided.length > 0) {
    setValue("supportProvided", supportProvided);
  }

  if (data.specify_other) {
    setValue("other", data.specify_other);
  }

  if (
    data.id &&
    data.client_helped_to_clean_up_and_put_away_dishes !== null &&
    data.client_helped_to_clean_up_and_put_away_dishes !== undefined
  ) {
    setValue(
      "clean",
      data.client_helped_to_clean_up_and_put_away_dishes ? "yes" : "no"
    );
  }
};

const MealTime: React.FC<MealTimeProps> = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  admin,
}) => {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<MealTimeFormData>({
    resolver: zodResolver(mealTimeSchema),
    defaultValues: {
      selectedOptions: [],
      supportProvided: [],
    },
  });

  const [loading, setLoading] = React.useState(false);
  const { submitMealTime } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  const { state } = useVisitingFormContext();

  const { step_two_form, isFormDisabled: stateDis } = state;
  const isFormDisabled = stateDis;

  useEffect(() => {
    if (step_two_form) {
      const mealTimeData =
        step_two_form.mealTime as unknown as Partial<MealTimeData>;

      populateMealTimeForm(mealTimeData, setValue);
    }
  }, [step_two_form, setValue]);

  const onSubmit = async (data: MealTimeFormData) => {
    setLoading(true);
    await submitMealTime({
      ...convertMealTimeData(data),
      client_helped_to_clean_up_and_put_away_dishes: data.clean === "yes",
      specify_what_snack_or_meal_provided: data.mealProvided,
      specify_other: data.other,
    });
    setLoading(false);
  };

  const saveDraft = async () => {
    setLoading(true);

    try {
      const data = getValues();

      await submitMealTime(
        {
          ...convertMealTimeData(data),
          client_helped_to_clean_up_and_put_away_dishes: data.clean === "yes",
          specify_what_snack_or_meal_provided: data.mealProvided,
          specify_other: data.other,
        },
        true
      );
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (
    field: "selectedOptions" | "supportProvided",
    value: string
  ) => {
    const currentValues = getValues(field) || [];

    if (value === "none" || value === "S_none") {
      if (
        currentValues.includes("none") ||
        currentValues.includes('"S_none"')
      ) {
        setValue(field, []);
      } else {
        setValue(field, ["none", "S_none"]);
      }
    } else {
      const c = currentValues
        .filter((item) => item !== "none")
        .filter((item) => item !== "S_none");
      if (currentValues.includes(value)) {
        setValue(
          field,
          c.filter((item: string) => item !== value)
        );
      } else {
        setValue(field, [...c, value]);
      }
    }
  };

  const watchSupportProvided = watch("supportProvided");
  const showOtherInput = watchSupportProvided.includes("other");

  const watchSelectedOptions = watch("selectedOptions");
  const showMealProvidedInput =
    watchSelectedOptions.includes("ate_all_meal_or_snack") ||
    watchSelectedOptions.includes("ate_some_meal_or_snack");

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);
  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3
        data-testid="meal-time-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Snack/ Meal Time
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">{username}</h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {options.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <Controller
                  name="selectedOptions"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Checkbox
                        id={option.value}
                        checked={(field.value as string[]).includes(
                          option.value
                        )}
                        onCheckedChange={() =>
                          handleCheckboxChange("selectedOptions", option.value)
                        }
                        disabled={isFormDisabled}
                        data-testid={`meal-provided-${option.value}`}
                      />
                    );
                  }}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={option.value}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.selectedOptions && (
            <p className="text-red-500 text-sm">
              {getErrorMessage(errors.selectedOptions)}
            </p>
          )}
          {showMealProvidedInput && (
            <Controller
              name="mealProvided"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText="Please specify what snack/meal was provided"
                  placeholder="Enter meal details"
                  type="text"
                  isAuth={false}
                  isError={!!errors.mealProvided}
                  disabled={isFormDisabled}
                  errorMessage={getErrorMessage(errors.mealProvided)}
                  data-testid="other-meal-provided"
                />
              )}
            />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I provided the following support to {username} during snack/meal
            time
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {supportOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <Controller
                  name="supportProvided"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={option.value}
                      disabled={isFormDisabled}
                      checked={(field.value as string[]).includes(option.value)}
                      onCheckedChange={() =>
                        handleCheckboxChange("supportProvided", option.value)
                      }
                      data-testid={`support-provided-${option.value}`}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={option.value}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.supportProvided && (
            <p className="text-red-500 text-sm">
              {getErrorMessage(errors.supportProvided)}
            </p>
          )}

          {showOtherInput && (
            <Controller
              name="other"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText="Please specify other support"
                  placeholder="Enter other support details"
                  type="text"
                  isAuth={false}
                  isError={!!errors.other}
                  disabled={isFormDisabled}
                  errorMessage={getErrorMessage(errors.other)}
                  data-testid="other-support-provided"
                />
              )}
            />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            {username} helped in cleaning up and putting away dishes after
            meal/snack
          </h4>

          <Controller
            name="clean"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col gap-5"
                defaultValue=""
                disabled={isFormDisabled}
                data-testid="client-helped-in-cleaning-radio"
              >
                <div className="flex items-center flex-wrap gap-5">
                  {["Yes", "No"].map((label) => (
                    <div key={label} className="flex items-center gap-2">
                      <RadioGroupItem
                        data-testid={`client-helped-in-cleaning-radio-item-${label.toLowerCase()}`}
                        id={label}
                        value={label.toLowerCase()}
                      />
                      <Label
                        className="text-[16px] font-[400] text-[#09090B]"
                        htmlFor={label}
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          />
        </div>

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] h-[9vh]">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            data-testid="previous-section-button"
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              type="button"
              isLoading={loading}
              onClick={() => saveDraft()}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              isLoading={loading}
              onClick={() => {
                handleChangeIndex(currentIndex + 1);
              }}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            currentIndex !== 6 && (
              <Button
                type="submit"
                isLoading={loading}
                data-testid="next-section-button"
              >
                Next Section <DoubleArrowRightIcon className="w-5 h-5" />
              </Button>
            )
          )}
        </div>
      </form>
    </section>
  );
};

export default MealTime;
