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
import { submitRespitePersonalCare } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

const personalCareSchema = z.object({
  bathroomIndependence: z.enum(["yes", "no"], {
    required_error: "Please select whether client used bathroom independently",
  }),
  bathroomAssistance: z
    .array(z.string())
    .min(1, "Please select at least one option"),
  otherBowel: z.string().optional(),
  hygieneSupport: z
    .array(z.string())
    .min(1, "Please select at least one option"),
  otherHygiene: z.string().optional(),
});

type PersonalCareFormData = z.infer<typeof personalCareSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  respiteForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const bathroomAssistanceOptions = [
  "Changing diapers",
  "Assisting with toileting",
  "None",
];

const hygieneSupportOptions = [
  "Shampooing",
  "Showering",
  "Teeth brushing",
  "Toweling",
  "Bathing",
  "Menstrual care",
  "None",
];

const RespitePersonalCare = ({
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
  const [selectOtherBowel, setSelectOtherBowel] = useState(false);
  const [selectOtherHygiene, setSelectOtherHygiene] = useState(false);
  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PersonalCareFormData>({
    resolver: zodResolver(personalCareSchema),
    defaultValues: {
      bathroomIndependence: undefined,
      bathroomAssistance: [],
      otherBowel: "",
      hygieneSupport: [],
      otherHygiene: "",
    },
  });

  useEffect(() => {
    if (!respiteForm?.personalCareAndBladderControl) return;

    setMethod("PATCH");
    const { personalCareAndBladderControl } = respiteForm;

    setValue(
      "bathroomIndependence",
      personalCareAndBladderControl.client_name_used_bathroom_without_assistance
        ? "yes"
        : "no"
    );

    const selectedBathroomAssistance = [];
    if (personalCareAndBladderControl.assisted_client_with_changing_diapers)
      selectedBathroomAssistance.push("Changing diapers");
    if (personalCareAndBladderControl.assisted_client_with_toileting)
      selectedBathroomAssistance.push("Assisting with toileting");
    if (selectedBathroomAssistance.length === 0)
      selectedBathroomAssistance.push("None");
    setValue("bathroomAssistance", selectedBathroomAssistance);

    if (personalCareAndBladderControl.other_bowel) {
      setSelectOtherBowel(true);
      setValue(
        "otherBowel",
        personalCareAndBladderControl.other_specify_bowel || ""
      );
    }

    const selectedHygieneSupport = [];
    if (personalCareAndBladderControl.supported_client_with_shampooing)
      selectedHygieneSupport.push("Shampooing");
    if (personalCareAndBladderControl.supported_client_with_showering)
      selectedHygieneSupport.push("Showering");
    if (personalCareAndBladderControl.supported_client_with_brushing_teeth)
      selectedHygieneSupport.push("Teeth brushing");
    if (personalCareAndBladderControl.supported_client_with_toweling)
      selectedHygieneSupport.push("Toweling");
    if (personalCareAndBladderControl.supported_client_with_bathing)
      selectedHygieneSupport.push("Bathing");
    if (personalCareAndBladderControl.supported_client_with_menstrual_care)
      selectedHygieneSupport.push("Menstrual care");
    if (selectedHygieneSupport.length === 0)
      selectedHygieneSupport.push("None");
    setValue("hygieneSupport", selectedHygieneSupport);

    if (personalCareAndBladderControl.other_personal_hygiene) {
      setSelectOtherHygiene(true);
      setValue(
        "otherHygiene",
        personalCareAndBladderControl.other_specify_personal_hygiene || ""
      );
    }
  }, [respiteForm, setValue]);

  const onSubmit = async (data: PersonalCareFormData) => {
    try {
      const token = localStorage.getItem("token") as string;
      if (!respiteForm?.id) return;

      const transformedData = {
        client_name_used_bathroom_without_assistance:
          data.bathroomIndependence === "yes",
        assisted_client_with_changing_diapers:
          data.bathroomAssistance.includes("Changing diapers"),
        assisted_client_with_toileting: data.bathroomAssistance.includes(
          "Assisting with toileting"
        ),
        other_bowel: data.bathroomAssistance.includes("Other"),
        other_specify_bowel: data.otherBowel,
        supported_client_with_bathing: data.hygieneSupport.includes("Bathing"),
        supported_client_with_brushing_teeth:
          data.hygieneSupport.includes("Teeth brushing"),
        supported_client_with_shampooing:
          data.hygieneSupport.includes("Shampooing"),
        supported_client_with_toweling:
          data.hygieneSupport.includes("Toweling"),
        supported_client_with_showering:
          data.hygieneSupport.includes("Showering"),
        supported_client_with_menstrual_care:
          data.hygieneSupport.includes("Menstrual care"),
        other_personal_hygiene: data.hygieneSupport.includes("Other"),
        other_specify_personal_hygiene: data.otherHygiene,
      };

      const response = await submitRespitePersonalCare(
        token,
        transformedData,
        respiteForm.id,
        method,
        respiteForm?.personalCareAndBladderControl?.id
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
      console.error("ERROR SUBMITTING PERSONAL CARE", err);
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
      if (!respiteForm?.id) return;

      const transformedData = {
        client_name_used_bathroom_without_assistance:
          data.bathroomIndependence === "yes",
        assisted_client_with_changing_diapers:
          data.bathroomAssistance.includes("Changing diapers"),
        assisted_client_with_toileting: data.bathroomAssistance.includes(
          "Assisting with toileting"
        ),
        other_bowel: data.bathroomAssistance.includes("Other"),
        other_specify_bowel: data.otherBowel,
        supported_client_with_bathing: data.hygieneSupport.includes("Bathing"),
        supported_client_with_brushing_teeth:
          data.hygieneSupport.includes("Teeth brushing"),
        supported_client_with_shampooing:
          data.hygieneSupport.includes("Shampooing"),
        supported_client_with_toweling:
          data.hygieneSupport.includes("Toweling"),
        supported_client_with_showering:
          data.hygieneSupport.includes("Showering"),
        supported_client_with_menstrual_care:
          data.hygieneSupport.includes("Menstrual care"),
        other_personal_hygiene: data.hygieneSupport.includes("Other"),
        other_specify_personal_hygiene: data.otherHygiene,
      };

      const response = await submitRespitePersonalCare(
        token,
        transformedData,
        respiteForm.id,
        method,
        respiteForm?.personalCareAndBladderControl?.id
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
    fieldName: "bathroomAssistance" | "hygieneSupport",
    value: string
  ) => {
    const selectedValues = getValues(fieldName);

    if (value === "None") {
      if (selectedValues.includes("None")) {
        setValue(fieldName, []);
      } else {
        setValue(fieldName, ["None"]);
      }
    } else {
      const filtered = selectedValues.filter((item: string) => item !== "None");
      if (filtered.includes(value)) {
        setValue(
          fieldName,
          filtered.filter((item: string) => item !== value)
        );
      } else {
        setValue(fieldName, [...filtered, value]);
      }
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
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Personal Care / Bowel And Bladder Control
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            {username} used the bathroom independently without my assistance
          </h4>

          <Controller
            name="bathroomIndependence"
            control={control}
            render={({ field }) => (
              <RadioGroup
                disabled={isFormDisabled}
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col gap-5"
              >
                <div>
                  <div className="flex items-center flex-wrap gap-5">
                    {["Yes", "No"].map((label) => (
                      <div key={label} className="flex items-center gap-2">
                        <RadioGroupItem
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
                  {errors?.bathroomIndependence && (
                    <p className="text-red-600 text-sm mt-2">
                      {errors.bathroomIndependence.message}
                    </p>
                  )}
                </div>
              </RadioGroup>
            )}
          />
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I assisted {username} in being more independent with [his/her]
            bladder and bowel by:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4">
            {bathroomAssistanceOptions.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Controller
                  name="bathroomAssistance"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={option}
                      checked={(field.value as string[]).includes(option)}
                      onCheckedChange={() =>
                        handleCheckboxChange("bathroomAssistance", option)
                      }
                      disabled={isFormDisabled}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={option}
                >
                  {option}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Checkbox
                id="other_bowel"
                checked={selectOtherBowel}
                onCheckedChange={(checked) => {
                  setSelectOtherBowel(checked === true);
                  if (!checked) {
                    setValue("otherBowel", "");
                  }
                }}
                disabled={isFormDisabled}
              />
              <Label
                className="text-[14px] font-[400] text-[#09090B]"
                htmlFor="other_bowel"
              >
                Other
              </Label>
            </div>
          </div>

          {errors.bathroomAssistance && (
            <p className="text-red-500 text-sm">
              {errors.bathroomAssistance.message}
            </p>
          )}

          {selectOtherBowel && (
            <Controller
              name="otherBowel"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText=""
                  placeholder="Please specify"
                  type="text"
                  isAuth={false}
                  isError={!!errors.otherBowel}
                  disabled={isFormDisabled}
                  errorMessage={errors.otherBowel?.message}
                />
              )}
            />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} practice the following personal hygiene:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4">
            {hygieneSupportOptions.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Controller
                  name="hygieneSupport"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={option}
                      checked={(field.value as string[]).includes(option)}
                      onCheckedChange={() =>
                        handleCheckboxChange("hygieneSupport", option)
                      }
                      disabled={isFormDisabled}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={option}
                >
                  {option}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Checkbox
                id="other_hygiene"
                checked={selectOtherHygiene}
                onCheckedChange={(checked) => {
                  setSelectOtherHygiene(checked === true);
                  if (!checked) {
                    setValue("otherHygiene", "");
                  }
                }}
                disabled={isFormDisabled}
              />
              <Label
                className="text-[14px] font-[400] text-[#09090B]"
                htmlFor="other_hygiene"
              >
                Other
              </Label>
            </div>
          </div>

          {errors.hygieneSupport && (
            <p className="text-red-500 text-sm">
              {errors.hygieneSupport.message}
            </p>
          )}

          {selectOtherHygiene && (
            <Controller
              name="otherHygiene"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText=""
                  placeholder="Please specify"
                  type="text"
                  isAuth={false}
                  isError={!!errors.otherHygiene}
                  disabled={isFormDisabled}
                  errorMessage={errors.otherHygiene?.message}
                />
              )}
            />
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

export default RespitePersonalCare;
