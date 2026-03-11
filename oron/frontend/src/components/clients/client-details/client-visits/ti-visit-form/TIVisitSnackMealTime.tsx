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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { submitRespiteSnackMealTime } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

const snackMealSchema = z.object({
  hadSnack: z.enum(["yes", "no"], {
    required_error: "Please select if client had snack/meal",
  }),
  mealOptions: z.array(z.string()),
  waterOptions: z.array(z.string()),
  juiceOptions: z.array(z.string()),
  mealProvided: z.string().optional(),
  supportProvided: z.array(z.string()),
  otherSupport: z.string().optional(),
  cleanedUp: z.enum(["yes", "no"], {
    required_error: "Please select if client helped in cleaning",
  }),
});

type SnackMealFormData = z.infer<typeof snackMealSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  tiForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const mealOptions = [
  { label: "Ate all the meal/snack", value: "ate_all" },
  { label: "Ate some of the meal/snack", value: "ate_some" },
  { label: "Didn't eat the meal/snack", value: "ate_none" },
];

const waterOptions = [
  { label: "Drank a lot of water", value: "drank_lot_water" },
  { label: "Drank some water", value: "drank_some_water" },
  { label: "Drank no water", value: "drank_no_water" },
];

const juiceOptions = [
  { label: "Drank a lot of juice", value: "drank_lot_juice" },
  { label: "Drank some juice", value: "drank_some_juice" },
  { label: "Drank no juice", value: "drank_no_juice" },
];

const supportOptions = [
  { label: "Prepare snack/meal", value: "prepare" },
  { label: "Served snack/meal", value: "serve" },
  { label: "Assisted with feeding", value: "assist_feeding" },
  { label: "Clean up after snack/meal", value: "clean_up" },
  { label: "Other", value: "other" },
];

const TIVisitSnackMealTime = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  tiForm,
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
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SnackMealFormData>({
    // resolver: zodResolver(snackMealSchema),
    defaultValues: {
      hadSnack: undefined,
      mealOptions: [],
      waterOptions: [],
      juiceOptions: [],
      mealProvided: "",
      supportProvided: [],
      otherSupport: "",
      cleanedUp: undefined,
    },
  });

  useEffect(() => {
    if (!tiForm?.snackMealTime) return;

    setMethod("PATCH");
    const { snackMealTime } = tiForm;

    // Set initial hadSnack value based on available data
    setValue(
      "hadSnack",
      Object.values(snackMealTime).some((value) => value === true)
        ? "yes"
        : "no"
    );

    // Populate mealOptions
    const mealOptionValues = [];
    if (snackMealTime.ate_all_meal_or_snack) mealOptionValues.push("ate_all");
    if (snackMealTime.ate_some_meal_or_snack) mealOptionValues.push("ate_some");
    if (snackMealTime.refused_all_meal_or_snack)
      mealOptionValues.push("ate_none");
    setValue("mealOptions", mealOptionValues);

    // Populate waterOptions
    const waterOptionValues = [];
    if (snackMealTime.drank_a_lot_of_water)
      waterOptionValues.push("drank_lot_water");
    if (snackMealTime.drank_some_water)
      waterOptionValues.push("drank_some_water");
    if (snackMealTime.refused_all_water)
      waterOptionValues.push("drank_no_water");
    setValue("waterOptions", waterOptionValues);

    // Populate juiceOptions
    const juiceOptionValues = [];
    if (snackMealTime.drank_a_lot_of_juice)
      juiceOptionValues.push("drank_lot_juice");
    if (snackMealTime.drank_some_juice)
      juiceOptionValues.push("drank_some_juice");
    if (snackMealTime.refused_all_juice)
      juiceOptionValues.push("drank_no_juice");
    setValue("juiceOptions", juiceOptionValues);

    // Populate supportProvided
    const supportProvidedValues = [];
    if (snackMealTime.prepared_snack_or_meal)
      supportProvidedValues.push("prepare");
    if (snackMealTime.served_snack_or_meal) supportProvidedValues.push("serve");
    if (snackMealTime.assisted_with_feeding)
      supportProvidedValues.push("assist_feeding");
    if (snackMealTime.clean_up_after_snack_or_meal)
      supportProvidedValues.push("clean_up");
    if (snackMealTime.other) supportProvidedValues.push("other");
    setValue("supportProvided", supportProvidedValues);

    // Set text field values
    setValue(
      "mealProvided",
      snackMealTime.specify_what_snack_or_meal_provided || ""
    );
    setValue("otherSupport", snackMealTime.specify_other || "");

    // Set cleanedUp value
    setValue(
      "cleanedUp",
      snackMealTime.client_helped_to_clean_up_and_put_away_dishes ? "yes" : "no"
    );
  }, [tiForm, setValue]);

  const hadSnack = watch("hadSnack");
  const supportProvided = watch("supportProvided");

  const onSubmit = async (data: SnackMealFormData) => {
    try {
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        ate_all_meal_or_snack: data.mealOptions.includes("ate_all"),
        ate_some_meal_or_snack: data.mealOptions.includes("ate_some"),
        refused_all_meal_or_snack: data.mealOptions.includes("ate_none"),
        drank_a_lot_of_water: data.waterOptions.includes("drank_lot_water"),
        drank_some_water: data.waterOptions.includes("drank_some_water"),
        refused_all_water: data.waterOptions.includes("drank_no_water"),
        drank_a_lot_of_juice: data.juiceOptions.includes("drank_lot_juice"),
        drank_some_juice: data.juiceOptions.includes("drank_some_juice"),
        refused_all_juice: data.juiceOptions.includes("drank_no_juice"),
        specify_what_snack_or_meal_provided: data.mealProvided,
        prepared_snack_or_meal: data.supportProvided.includes("prepare"),
        served_snack_or_meal: data.supportProvided.includes("serve"),
        assisted_with_feeding: data.supportProvided.includes("assist_feeding"),
        clean_up_after_snack_or_meal: data.supportProvided.includes("clean_up"),
        other: data.supportProvided.includes("other"),
        specify_other: data.otherSupport,
        client_helped_to_clean_up_and_put_away_dishes: data.cleanedUp === "yes",
      };

      const response = await submitRespiteSnackMealTime(
        token,
        transformedData,
        tiForm?.id!,
        method,
        tiForm?.snackMealTime?.id
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
        ate_all_meal_or_snack: data.mealOptions.includes(
          "ate_all_meal_or_snack"
        ),
        ate_some_meal_or_snack: data.mealOptions.includes(
          "ate_some_meal_or_snack"
        ),
        refused_all_meal_or_snack: data.mealOptions.includes(
          "refused_all_meal_or_snack"
        ),
        drank_a_lot_of_water: data.waterOptions.includes(
          "drank_a_lot_of_water"
        ),
        drank_some_water: data.waterOptions.includes("drank_some_water"),
        refused_all_water: data.waterOptions.includes("refused_all_water"),
        drank_a_lot_of_juice: data.juiceOptions.includes(
          "drank_a_lot_of_juice"
        ),
        drank_some_juice: data.juiceOptions.includes("drank_some_juice"),
        refused_all_juice: data.juiceOptions.includes("refused_all_juice"),
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
        specify_other: data.otherSupport,
        client_helped_to_clean_up_and_put_away_dishes: data.cleanedUp === "yes",
      };

      const response = await submitRespiteSnackMealTime(
        token,
        transformedData,
        tiForm?.id!,
        method,
        tiForm?.snackMealTime?.id
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

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Snack/ Meal Time
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <p className="text-lg">
              Did {username} eat any snack/meal during this session?
            </p>
            <Controller
              name="hadSnack"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex items-center gap-4"
                  disabled={isFormDisabled}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="yes" value="yes" />
                    <Label htmlFor="yes">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="no" value="no" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {hadSnack === "yes" && (
            <>
              <div className="flex flex-col gap-4">
                <p className="text-lg font-semibold">{username}:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-4">
                    {mealOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center gap-2"
                      >
                        <Controller
                          name="mealOptions"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, option.value]
                                  : field.value.filter(
                                      (v) => v !== option.value
                                    );
                                field.onChange(newValue);
                              }}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                        <Label>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-4">
                    {waterOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center gap-2"
                      >
                        <Controller
                          name="waterOptions"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, option.value]
                                  : field.value.filter(
                                      (v) => v !== option.value
                                    );
                                field.onChange(newValue);
                              }}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                        <Label>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-4">
                    {juiceOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center gap-2"
                      >
                        <Controller
                          name="juiceOptions"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, option.value]
                                  : field.value.filter(
                                      (v) => v !== option.value
                                    );
                                field.onChange(newValue);
                              }}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                        <Label>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Controller
                  name="mealProvided"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Please specify what snack/meal was provided"
                      className="mt-2"
                      disabled={isFormDisabled}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-lg">
                  I provided the following support to {username} during
                  snack/meal time
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supportOptions.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <Controller
                        name="supportProvided"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, option.value]
                                : field.value.filter((v) => v !== option.value);
                              field.onChange(newValue);
                            }}
                            disabled={isFormDisabled}
                          />
                        )}
                      />
                      <Label>{option.label}</Label>
                    </div>
                  ))}
                </div>

                {supportProvided.includes("other") && (
                  <Controller
                    name="otherSupport"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Please explain"
                        className="mt-2"
                        disabled={isFormDisabled}
                      />
                    )}
                  />
                )}
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-lg">
                  {username} helped in cleaning up and putting it away dishes
                  after meal/snack
                </p>
                <Controller
                  name="cleanedUp"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex items-center gap-4"
                      disabled={isFormDisabled}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem id="clean-yes" value="yes" />
                        <Label htmlFor="clean-yes">Yes</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem id="clean-no" value="no" />
                        <Label htmlFor="clean-no">No</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
            </>
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

export default TIVisitSnackMealTime;
