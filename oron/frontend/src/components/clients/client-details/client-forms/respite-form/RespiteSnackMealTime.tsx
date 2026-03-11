"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { toast } from "@/components/ui/use-toast";
import { submitRespiteSnackMealTime } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

const snackMealSchema = z.object({
  selectedOptions: z
    .array(z.string())
    .min(1, "Please select at least one option"),
  mealProvided: z
    .string()
    .min(1, "Please specify what snack/meal was provided"),
  supportProvided: z
    .array(z.string())
    .min(1, "Please select at least one option"),
  other: z.string().optional(),
  clean: z.enum(["yes", "no"], {
    required_error: "Please select if client helped in cleaning",
  }),
});

type SnackMealFormData = z.infer<typeof snackMealSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  respiteForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
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
];

const supportOptions = [
  { label: "Prepare snack/meal", value: "prepared_snack_or_meal" },
  { label: "Clean up after snack/meal", value: "clean_up_after_snack_or_meal" },
  { label: "Served snack/meal", value: "served_snack_or_meal" },
  { label: "Assisted with feeding", value: "assisted_with_feeding" },
  { label: "Other", value: "other" },
];

const RespiteSnackMealTime = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  respiteForm,
  isViewing,
  isEditing,
  username = "Client",
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SnackMealFormData>({
    resolver: zodResolver(snackMealSchema),
    defaultValues: {
      selectedOptions: [],
      supportProvided: [],
      mealProvided: "",
      other: "",
    },
  });

  useEffect(() => {
    if (!respiteForm?.snackMealTime) return;

    setMethod("PATCH");
    const { snackMealTime } = respiteForm;

    // Populate form with existing data
    const selectedOptions = [];
    if (snackMealTime.ate_all_meal_or_snack)
      selectedOptions.push("ate_all_meal_or_snack");
    if (snackMealTime.ate_some_meal_or_snack)
      selectedOptions.push("ate_some_meal_or_snack");
    if (snackMealTime.refused_all_meal_or_snack)
      selectedOptions.push("refused_all_meal_or_snack");
    if (snackMealTime.drank_a_lot_of_water)
      selectedOptions.push("drank_a_lot_of_water");
    if (snackMealTime.drank_some_water)
      selectedOptions.push("drank_some_water");
    if (snackMealTime.refused_all_water)
      selectedOptions.push("refused_all_water");
    if (snackMealTime.drank_a_lot_of_juice)
      selectedOptions.push("drank_a_lot_of_juice");
    if (snackMealTime.drank_some_juice)
      selectedOptions.push("drank_some_juice");
    if (snackMealTime.refused_all_juice)
      selectedOptions.push("refused_all_juice");

    const supportProvided = [];
    if (snackMealTime.prepared_snack_or_meal)
      supportProvided.push("prepared_snack_or_meal");
    if (snackMealTime.served_snack_or_meal)
      supportProvided.push("served_snack_or_meal");
    if (snackMealTime.assisted_with_feeding)
      supportProvided.push("assisted_with_feeding");
    if (snackMealTime.clean_up_after_snack_or_meal)
      supportProvided.push("clean_up_after_snack_or_meal");
    if (snackMealTime.other) supportProvided.push("other");

    setValue("selectedOptions", selectedOptions);
    setValue("supportProvided", supportProvided);
    setValue(
      "mealProvided",
      snackMealTime.specify_what_snack_or_meal_provided || ""
    );
    setValue("other", snackMealTime.specify_other || "");
    setValue(
      "clean",
      snackMealTime.client_helped_to_clean_up_and_put_away_dishes ? "yes" : "no"
    );
  }, [respiteForm, setValue]);

  const onSubmit = async (data: SnackMealFormData) => {
    try {
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        ate_all_meal_or_snack: data.selectedOptions.includes(
          "ate_all_meal_or_snack"
        ),
        ate_some_meal_or_snack: data.selectedOptions.includes(
          "ate_some_meal_or_snack"
        ),
        refused_all_meal_or_snack: data.selectedOptions.includes(
          "refused_all_meal_or_snack"
        ),
        drank_a_lot_of_water: data.selectedOptions.includes(
          "drank_a_lot_of_water"
        ),
        drank_some_water: data.selectedOptions.includes("drank_some_water"),
        refused_all_water: data.selectedOptions.includes("refused_all_water"),
        drank_a_lot_of_juice: data.selectedOptions.includes(
          "drank_a_lot_of_juice"
        ),
        drank_some_juice: data.selectedOptions.includes("drank_some_juice"),
        refused_all_juice: data.selectedOptions.includes("refused_all_juice"),
        specify_what_snack_or_meal_provided: data.mealProvided,
        prepared_snack_or_meal: data.supportProvided.includes(
          "prepared_snack_or_meal"
        ),
        served_snack_or_meal: data.supportProvided.includes(
          "served_snack_or_meal"
        ),
        assisted_with_feeding: data.supportProvided.includes(
          "assisted_with_feeding"
        ),
        clean_up_after_snack_or_meal: data.supportProvided.includes(
          "clean_up_after_snack_or_meal"
        ),
        other: data.supportProvided.includes("other"),
        specify_other: data.other,
        client_helped_to_clean_up_and_put_away_dishes: data.clean === "yes",
      };

      const response = await submitRespiteSnackMealTime(
        token,
        transformedData,
        respiteForm?.id!,
        method,
        respiteForm?.snackMealTime?.id
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (err) {
      console.error("ERROR SUBMITTING SNACK/MEAL TIME", err);
      toast({
        variant: "destructive",
        description: "Failed to submit form",
      });
    }
  };

  const handleDraftSubmit = async () => {
    try {
      setIsSubmittingDraft(true);
      const data = getValues();
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        ate_all_meal_or_snack: data.selectedOptions.includes(
          "ate_all_meal_or_snack"
        ),
        ate_some_meal_or_snack: data.selectedOptions.includes(
          "ate_some_meal_or_snack"
        ),
        refused_all_meal_or_snack: data.selectedOptions.includes(
          "refused_all_meal_or_snack"
        ),
        drank_a_lot_of_water: data.selectedOptions.includes(
          "drank_a_lot_of_water"
        ),
        drank_some_water: data.selectedOptions.includes("drank_some_water"),
        refused_all_water: data.selectedOptions.includes("refused_all_water"),
        drank_a_lot_of_juice: data.selectedOptions.includes(
          "drank_a_lot_of_juice"
        ),
        drank_some_juice: data.selectedOptions.includes("drank_some_juice"),
        refused_all_juice: data.selectedOptions.includes("refused_all_juice"),
        specify_what_snack_or_meal_provided: data.mealProvided,
        prepared_snack_or_meal: data.supportProvided.includes(
          "prepared_snack_or_meal"
        ),
        served_snack_or_meal: data.supportProvided.includes(
          "served_snack_or_meal"
        ),
        assisted_with_feeding: data.supportProvided.includes(
          "assisted_with_feeding"
        ),
        clean_up_after_snack_or_meal: data.supportProvided.includes(
          "clean_up_after_snack_or_meal"
        ),
        other: data.supportProvided.includes("other"),
        specify_other: data.other,
        client_helped_to_clean_up_and_put_away_dishes: data.clean === "yes",
      };

      const response = await submitRespiteSnackMealTime(
        token,
        transformedData,
        respiteForm?.id!,
        method,
        respiteForm?.snackMealTime?.id
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      toast({
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("ERROR SAVING DRAFT", err);
      toast({
        variant: "destructive",
        description: "Failed to save draft",
      });
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  const handleCheckboxChange = (
    field: "selectedOptions" | "supportProvided",
    value: string
  ) => {
    const currentValues = getValues(field) || [];
    if (currentValues.includes(value)) {
      setValue(
        field,
        currentValues.filter((item: string) => item !== value)
      );
    } else {
      setValue(field, [...currentValues, value]);
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
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
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
                  render={({ field }) => (
                    <Checkbox
                      id={option.value}
                      checked={(field.value as string[]).includes(option.value)}
                      onCheckedChange={() =>
                        handleCheckboxChange("selectedOptions", option.value)
                      }
                      disabled={isFormDisabled}
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

          {showMealProvidedInput && (
            <Controller
              name="mealProvided"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText="Please specify what snack/meal was provided"
                  placeholder="Enter meal details"
                  type="text"
                  isAuth={false}
                  isError={!!errors.mealProvided}
                  disabled={isFormDisabled}
                  errorMessage={errors.mealProvided?.message}
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
                      checked={(field.value as string[]).includes(option.value)}
                      onCheckedChange={() =>
                        handleCheckboxChange("supportProvided", option.value)
                      }
                      disabled={isFormDisabled}
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

          {showOtherInput && (
            <Controller
              name="other"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText="Please specify other support"
                  placeholder="Enter other support details"
                  type="text"
                  isAuth={false}
                  isError={!!errors.other}
                  disabled={isFormDisabled}
                  errorMessage={errors.other?.message}
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
                disabled={isFormDisabled}
              >
                <div className="flex items-center flex-wrap gap-5">
                  {["Yes", "No"].map((label) => (
                    <div key={label} className="flex items-center gap-2">
                      <RadioGroupItem id={label} value={label.toLowerCase()} />
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
          {errors.clean && (
            <p className="text-red-500 text-sm">{errors.clean.message}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              type="button"
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button onClick={() => handleChangeIndex(currentIndex + 1)}>
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default RespiteSnackMealTime;
