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
import FormInput from "@/components/input-fields/FormInput";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FormSelect from "@/components/input-fields/FormSelect";
import FormTextArea from "@/components/input-fields/FormTextArea";
import { submitAlpHomeLiving } from "@/actions/clients/alp-form/intakeAssessment";

type OptionType<T extends keyof HomeLivingFormData> = {
  id: keyof HomeLivingFormData[T];
  label: string;
};

const MAINTAINING_HYGIENE_OPTIONS: OptionType<"maintainingGoodHygiene">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "bathingOrShowering", label: "Bathing or showering" },
  { id: "brushingTeeth", label: "Brushing teeth" },
  { id: "hairCare", label: "Hair care" },
  { id: "usingDeodorant", label: "Using deodorant" },
  { id: "shaving", label: "Shaving" },
  { id: "feminineHygiene", label: "Feminine hygiene / Menstruation hygiene" },
  { id: "other", label: "Other" },
];

const GETTING_DRESSED_OPTIONS: OptionType<"gettingDressed">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  {
    id: "selectingAppropriateClothing",
    label: "Selecting appropriate clothing for season",
  },
  { id: "dressingIndependently", label: "Dressing independently" },
  { id: "zippingUnzipping", label: "Zipping/Unzipping" },
  { id: "fasteningUnfasteningButtons", label: "Fastening/Unfastening buttons" },
  { id: "other", label: "Other" },
];

const STAY_ON_SCHEDULE_OPTIONS: OptionType<"stayOnSchedule">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "departingAndArrivingOnTime", label: "Departing and arriving on time" },
  { id: "usingCalendar", label: "Using calendar" },
  { id: "tellingTime", label: "Telling time (devices used)" },
  { id: "other", label: "Other" },
];

const HOUSEHOLD_CLEANING_OPTIONS: OptionType<"householdCleaning">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "maintainingLivingAreas", label: "Maintaining living areas" },
  {
    id: "washingAndDryingClothesLaundromat",
    label: "Washing and drying clothes in laundromat",
  },
  {
    id: "developingLaundrySchedule",
    label: "Developing and maintaining a laundry schedule",
  },
  { id: "usingLaundryAppliances", label: "Using laundry appliances" },
  { id: "usingLaundryProducts", label: "Using laundry products" },
  { id: "foldingAndStoringClothes", label: "Folding and storing clothes" },
  { id: "other", label: "Other" },
];

const LAUNDRY_OPTIONS: OptionType<"laundry">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  {
    id: "washingAndDryingClothesHome",
    label: "Washing and drying clothes in home",
  },
  {
    id: "washingAndDryingClothesLaundromat",
    label: "Washing and drying clothes in laundromat",
  },
  {
    id: "developingLaundrySchedule",
    label: "Developing and maintaining a laundry schedule",
  },
  { id: "usingLaundryAppliances", label: "Using laundry appliances" },
  { id: "usingLaundryProducts", label: "Using laundry products" },
  { id: "foldingAndStoringClothes", label: "Folding and storing clothes" },
  { id: "other", label: "Other" },
];

const HOME_MAINTENANCE_OPTIONS: OptionType<"homeMaintenance">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "changingLightBulbs", label: "Changing the light bulbs" },
  { id: "completingSimpleRepairs", label: "Completing simple repairs" },
  {
    id: "callingRepairpersons",
    label: "Calling repairpersons for larger repairs",
  },
  { id: "completingLawnCare", label: "Completing lawn care" },
  { id: "other", label: "Other" },
];

const MEAL_PREPARATION_OPTIONS: OptionType<"mealPreparation">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "preparingMeals", label: "Preparing meals (breakfast, lunch, snacks)" },
  {
    id: "followingMealPreparationSchedule",
    label: "Following meal preparation schedule/recipe",
  },
  {
    id: "usingKitchenEquipment",
    label: "Using kitchen equipment (microwave, stove top toaster)",
  },
  { id: "storingFoodSafely", label: "Storing food safely" },
  { id: "other", label: "Other" },
];

const SHOPPING_OPTIONS: OptionType<"shopping">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "identifyingNeededItems", label: "Identifying needed items" },
  {
    id: "identifyingRightStore",
    label: "Identifying the right store and scheduling a time to shop",
  },
  { id: "developingShoppingList", label: "Developing a shopping list" },
  {
    id: "payingForItem",
    label: "Paying for item (tender used; credit card, cash, coins)",
  },
  { id: "shoppingForFood", label: "Shopping for food" },
  { id: "ordersFromMenu", label: "Orders from a menu" },
  { id: "other", label: "Other" },
];

const homeLivingSchema = z.object({
  maintainingGoodHygiene: z.object({
    notApplicable: z.boolean(),
    bathingOrShowering: z.boolean(),
    brushingTeeth: z.boolean(),
    hairCare: z.boolean(),
    usingDeodorant: z.boolean(),
    shaving: z.boolean(),
    feminineHygiene: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
    levelOfSupport: z.string(),
  }),
  gettingDressed: z.object({
    notApplicable: z.boolean(),
    selectingAppropriateClothing: z.boolean(),
    dressingIndependently: z.boolean(),
    zippingUnzipping: z.boolean(),
    fasteningUnfasteningButtons: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
    levelOfSupport: z.string(),
  }),
  stayOnSchedule: z.object({
    notApplicable: z.boolean(),
    departingAndArrivingOnTime: z.boolean(),
    usingCalendar: z.boolean(),
    tellingTime: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
    levelOfSupport: z.string(),
  }),
  householdCleaning: z.object({
    notApplicable: z.boolean(),
    maintainingLivingAreas: z.boolean(),
    washingAndDryingClothesLaundromat: z.boolean(),
    developingLaundrySchedule: z.boolean(),
    usingLaundryAppliances: z.boolean(),
    usingLaundryProducts: z.boolean(),
    foldingAndStoringClothes: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
    levelOfSupport: z.string(),
  }),
  laundry: z.object({
    notApplicable: z.boolean(),
    washingAndDryingClothesHome: z.boolean(),
    washingAndDryingClothesLaundromat: z.boolean(),
    developingLaundrySchedule: z.boolean(),
    usingLaundryAppliances: z.boolean(),
    usingLaundryProducts: z.boolean(),
    foldingAndStoringClothes: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
    levelOfSupport: z.string(),
  }),
  homeMaintenance: z.object({
    notApplicable: z.boolean(),
    changingLightBulbs: z.boolean(),
    completingSimpleRepairs: z.boolean(),
    callingRepairpersons: z.boolean(),
    completingLawnCare: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
    levelOfSupport: z.string(),
  }),
  mealPreparation: z.object({
    notApplicable: z.boolean(),
    preparingMeals: z.boolean(),
    followingMealPreparationSchedule: z.boolean(),
    usingKitchenEquipment: z.boolean(),
    storingFoodSafely: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
    levelOfSupport: z.string(),
  }),
  shopping: z.object({
    notApplicable: z.boolean(),
    identifyingNeededItems: z.boolean(),
    identifyingRightStore: z.boolean(),
    developingShoppingList: z.boolean(),
    payingForItem: z.boolean(),
    shoppingForFood: z.boolean(),
    ordersFromMenu: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
    levelOfSupport: z.string(),
  }),
  potentialBarriers: z.string(),
  relatedInformation: z.string(),
  otherComments: z.string(),
});

type HomeLivingFormData = z.infer<typeof homeLivingSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  isViewing?: boolean;
  isEditing?: boolean;
}

const AlpIntakeAssessmentHomeLiving = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  isViewing,
  isEditing,
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const isFormDisabled = isViewing;
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<HomeLivingFormData>({
    resolver: zodResolver(homeLivingSchema),
    defaultValues: {
      maintainingGoodHygiene: {
        notApplicable: false,
        bathingOrShowering: false,
        brushingTeeth: false,
        hairCare: false,
        usingDeodorant: false,
        shaving: false,
        feminineHygiene: false,
        other: false,
        otherSpecify: "",
        levelOfSupport: "",
      },
      gettingDressed: {
        notApplicable: false,
        selectingAppropriateClothing: false,
        dressingIndependently: false,
        zippingUnzipping: false,
        fasteningUnfasteningButtons: false,
        other: false,
        otherSpecify: "",
        levelOfSupport: "",
      },
      stayOnSchedule: {
        notApplicable: false,
        departingAndArrivingOnTime: false,
        usingCalendar: false,
        tellingTime: false,
        other: false,
        otherSpecify: "",
        levelOfSupport: "",
      },
      householdCleaning: {
        notApplicable: false,
        maintainingLivingAreas: false,
        washingAndDryingClothesLaundromat: false,
        developingLaundrySchedule: false,
        usingLaundryAppliances: false,
        usingLaundryProducts: false,
        foldingAndStoringClothes: false,
        other: false,
        otherSpecify: "",
        levelOfSupport: "",
      },
      laundry: {
        notApplicable: false,
        washingAndDryingClothesHome: false,
        washingAndDryingClothesLaundromat: false,
        developingLaundrySchedule: false,
        usingLaundryAppliances: false,
        usingLaundryProducts: false,
        foldingAndStoringClothes: false,
        other: false,
        otherSpecify: "",
        levelOfSupport: "",
      },
      homeMaintenance: {
        notApplicable: false,
        changingLightBulbs: false,
        completingSimpleRepairs: false,
        callingRepairpersons: false,
        completingLawnCare: false,
        other: false,
        otherSpecify: "",
        levelOfSupport: "",
      },
      mealPreparation: {
        notApplicable: false,
        preparingMeals: false,
        followingMealPreparationSchedule: false,
        usingKitchenEquipment: false,
        storingFoodSafely: false,
        other: false,
        otherSpecify: "",
        levelOfSupport: "",
      },
      shopping: {
        notApplicable: false,
        identifyingNeededItems: false,
        identifyingRightStore: false,
        developingShoppingList: false,
        payingForItem: false,
        shoppingForFood: false,
        ordersFromMenu: false,
        other: false,
        otherSpecify: "",
        levelOfSupport: "",
      },
      potentialBarriers: "",
      relatedInformation: "",
      otherComments: "",
    },
  });

  const watchMaintainingHygieneOther = watch("maintainingGoodHygiene.other");
  const watchGettingDressedOther = watch("gettingDressed.other");
  const watchStayOnScheduleOther = watch("stayOnSchedule.other");
  const watchHouseholdCleaningOther = watch("householdCleaning.other");
  const watchLaundryOther = watch("laundry.other");
  const watchHomeMaintenanceOther = watch("homeMaintenance.other");
  const watchMealPreparationOther = watch("mealPreparation.other");
  const watchShoppingOther = watch("shopping.other");

  const onSubmit = async (data: HomeLivingFormData) => {
    try {
      // TODO: Implement submission logic

      const token = localStorage.getItem("token") as string;

      const requestBody: any = {};

      const { status, errorMessage } = await submitAlpHomeLiving(
        token,
        requestBody,
        method,
        ""
      );

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (err) {
      console.error("ERROR SUBMITTING HOME LIVING", err);
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
      // TODO: Implement draft saving logic

      const token = localStorage.getItem("token") as string;

      const requestBody: any = {};

      const { status, errorMessage } = await submitAlpHomeLiving(
        token,
        requestBody,
        method,
        ""
      );

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
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

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Home Living Skills
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 lg:min-w-[768px] md:min-w-full">
              {/* Headers */}
              <div className="grid grid-cols-6 p-4 border-b">
                <div>
                  <h4 className="text-[#0F172A] text-[16px] font-[500]">
                    Home Living Skills
                  </h4>
                </div>
                <div className="col-span-3">
                  <h4 className="text-[#0F172A] text-[16px] font-[500]">
                    Areas of support
                  </h4>
                </div>
                <div className="col-span-2">
                  <h4 className="text-[#0F172A] text-[16px] font-[500]">
                    Level of support needed
                  </h4>
                </div>
              </div>

              <div className="divide-y">
                {/* Maintaining Good Hygiene */}
                <div className="grid grid-cols-6">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Maintaining Good Hygiene
                    </h4>
                  </div>
                  <div className="col-span-3 p-4">
                    <div className="space-y-4">
                      {MAINTAINING_HYGIENE_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`maintainingGoodHygiene.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`maintainingHygiene${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`maintainingHygiene${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchMaintainingHygieneOther && (
                        <Controller
                          name="maintainingGoodHygiene.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 p-4">
                    <Controller
                      name="maintainingGoodHygiene.levelOfSupport"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isFormDisabled}
                          placeholder="Select"
                          selectContent={[
                            { label: "Independent", value: "independent" },
                            { label: "Minimal Support", value: "minimal" },
                            { label: "Moderate Support", value: "moderate" },
                            { label: "High Support", value: "high" },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Getting Dressed */}
                <div className="grid grid-cols-6">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Getting Dressed
                    </h4>
                  </div>
                  <div className="col-span-3 p-4">
                    <div className="space-y-4">
                      {GETTING_DRESSED_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`gettingDressed.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`gettingDressed${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`gettingDressed${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchGettingDressedOther && (
                        <Controller
                          name="gettingDressed.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 p-4">
                    <Controller
                      name="gettingDressed.levelOfSupport"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isFormDisabled}
                          placeholder="Select"
                          selectContent={[
                            { label: "Independent", value: "independent" },
                            { label: "Minimal Support", value: "minimal" },
                            { label: "Moderate Support", value: "moderate" },
                            { label: "High Support", value: "high" },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Stay On Schedule */}
                <div className="grid grid-cols-6">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Stay On Schedule
                    </h4>
                  </div>
                  <div className="col-span-3 p-4">
                    <div className="space-y-4">
                      {STAY_ON_SCHEDULE_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`stayOnSchedule.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`stayOnSchedule${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`stayOnSchedule${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchStayOnScheduleOther && (
                        <Controller
                          name="stayOnSchedule.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 p-4">
                    <Controller
                      name="stayOnSchedule.levelOfSupport"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isFormDisabled}
                          placeholder="Select"
                          selectContent={[
                            { label: "Independent", value: "independent" },
                            { label: "Minimal Support", value: "minimal" },
                            { label: "Moderate Support", value: "moderate" },
                            { label: "High Support", value: "high" },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Household Cleaning */}
                <div className="grid grid-cols-6">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Household Cleaning
                    </h4>
                  </div>
                  <div className="col-span-3 p-4">
                    <div className="space-y-4">
                      {HOUSEHOLD_CLEANING_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`householdCleaning.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`householdCleaning${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`householdCleaning${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchHouseholdCleaningOther && (
                        <Controller
                          name="householdCleaning.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 p-4">
                    <Controller
                      name="householdCleaning.levelOfSupport"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isFormDisabled}
                          placeholder="Select"
                          selectContent={[
                            { label: "Independent", value: "independent" },
                            { label: "Minimal Support", value: "minimal" },
                            { label: "Moderate Support", value: "moderate" },
                            { label: "High Support", value: "high" },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Laundry */}
                <div className="grid grid-cols-6">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Laundry
                    </h4>
                  </div>
                  <div className="col-span-3 p-4">
                    <div className="space-y-4">
                      {LAUNDRY_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`laundry.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`laundry${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`laundry${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchLaundryOther && (
                        <Controller
                          name="laundry.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 p-4">
                    <Controller
                      name="laundry.levelOfSupport"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isFormDisabled}
                          placeholder="Select"
                          selectContent={[
                            { label: "Independent", value: "independent" },
                            { label: "Minimal Support", value: "minimal" },
                            { label: "Moderate Support", value: "moderate" },
                            { label: "High Support", value: "high" },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Home Maintenance */}
                <div className="grid grid-cols-6">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Home Maintenance
                    </h4>
                  </div>
                  <div className="col-span-3 p-4">
                    <div className="space-y-4">
                      {HOME_MAINTENANCE_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`homeMaintenance.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`homeMaintenance${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`homeMaintenance${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchHomeMaintenanceOther && (
                        <Controller
                          name="homeMaintenance.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 p-4">
                    <Controller
                      name="homeMaintenance.levelOfSupport"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isFormDisabled}
                          placeholder="Select"
                          selectContent={[
                            { label: "Independent", value: "independent" },
                            { label: "Minimal Support", value: "minimal" },
                            { label: "Moderate Support", value: "moderate" },
                            { label: "High Support", value: "high" },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Meal Preparation */}
                <div className="grid grid-cols-6">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Meal Preparation
                    </h4>
                  </div>
                  <div className="col-span-3 p-4">
                    <div className="space-y-4">
                      {MEAL_PREPARATION_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`mealPreparation.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`mealPreparation${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`mealPreparation${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchMealPreparationOther && (
                        <Controller
                          name="mealPreparation.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 p-4">
                    <Controller
                      name="mealPreparation.levelOfSupport"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isFormDisabled}
                          placeholder="Select"
                          selectContent={[
                            { label: "Independent", value: "independent" },
                            { label: "Minimal Support", value: "minimal" },
                            { label: "Moderate Support", value: "moderate" },
                            { label: "High Support", value: "high" },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Shopping */}
                <div className="grid grid-cols-6">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Shopping
                    </h4>
                  </div>
                  <div className="col-span-3 p-4">
                    <div className="space-y-4">
                      {SHOPPING_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`shopping.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`shopping${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`shopping${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchShoppingOther && (
                        <Controller
                          name="shopping.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 p-4">
                    <Controller
                      name="shopping.levelOfSupport"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isFormDisabled}
                          placeholder="Select"
                          selectContent={[
                            { label: "Independent", value: "independent" },
                            { label: "Minimal Support", value: "minimal" },
                            { label: "Moderate Support", value: "moderate" },
                            { label: "High Support", value: "high" },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Additional Text Areas */}
                <div className="grid grid-cols-6">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Potential Barriers
                    </h4>
                  </div>
                  <div className="col-span-5 p-4">
                    <Controller
                      name="potentialBarriers"
                      control={control}
                      render={({ field }) => (
                        <FormTextArea
                          {...field}
                          placeholder="Enter here"
                          disabled={isFormDisabled}
                          className="min-h-[100px] w-full"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Related information from other AW services
                    </h4>
                  </div>
                  <div className="col-span-5 p-4">
                    <Controller
                      name="relatedInformation"
                      control={control}
                      render={({ field }) => (
                        <FormTextArea
                          {...field}
                          placeholder="Enter here"
                          disabled={isFormDisabled}
                          className="min-h-[100px] w-full"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Other Comments
                    </h4>
                  </div>
                  <div className="col-span-5 p-4">
                    <Controller
                      name="otherComments"
                      control={control}
                      render={({ field }) => (
                        <FormTextArea
                          {...field}
                          placeholder="Enter here"
                          disabled={isFormDisabled}
                          className="min-h-[100px] w-full"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
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

export default AlpIntakeAssessmentHomeLiving;
