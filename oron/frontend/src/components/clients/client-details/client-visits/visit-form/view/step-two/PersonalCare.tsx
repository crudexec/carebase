import React, { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
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
import { getErrorMessage, PersonalCareOutput } from "@/utils/helpers";
import useVisitingFormSubmission from "../../logic";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { personalCareSchema } from "../../logic/schema";

type PersonalCareFormData = z.infer<typeof personalCareSchema>;

interface PersonalCareProps {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  admin?: boolean;
}

const bathroomAssistanceOptions = [
  "Changing diapers",
  "Assisting with toileting",
  "None",
];

const hygieneSupportOptions = [
  "Bathing",
  "Brushing teeth",
  "Shampooing",
  "Toweling",
  "Showering",
  "Menstrual care",
  "None",
];

const convertPersonalCare = (
  input: PersonalCareFormData
): PersonalCareOutput => {
  return {
    client_name_used_bathroom_without_assistance:
      input.bathroomIndependence === "yes"
        ? true
        : input.bathroomIndependence === "no"
        ? false
        : null,
    assisted_client_with_changing_diapers:
      input.bathroomAssistance.includes("Changing diapers"),
    assisted_client_with_toileting: input.bathroomAssistance.includes(
      "Assisting with toileting"
    ),
    other_bowel: !!input.otherBowel,
    other_specify_bowel: input.otherBowel || null,
    supported_client_with_bathing: input.hygieneSupport.includes("Bathing"),
    supported_client_with_brushing_teeth:
      input.hygieneSupport.includes("Brushing teeth"),
    supported_client_with_shampooing:
      input.hygieneSupport.includes("Shampooing"),
    supported_client_with_toweling: input.hygieneSupport.includes("Toweling"),
    supported_client_with_showering: input.hygieneSupport.includes("Showering"),
    supported_client_with_menstrual_care:
      input.hygieneSupport.includes("Menstrual care"),
    other_personal_hygiene: !!input.otherHygiene,
    other_specify_personal_hygiene: input.otherHygiene || null,
  };
};

const PersonalCare: React.FC<PersonalCareProps> = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  admin,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<PersonalCareFormData>({
    resolver: zodResolver(personalCareSchema),
    defaultValues: {
      bathroomIndependence: "",
      bathroomAssistance: [],
      hygieneSupport: [],
    },
  });
  const [selectOtherBowel, setSelectOtherBowel] = useState(false);
  const [selectOtherHygiene, setSelectOtherHygiene] = useState(false);

  const { submitPersonal } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  const { state } = useVisitingFormContext();
  const { step_two_form, isFormDisabled } = state;

  useEffect(() => {
    if (step_two_form && step_two_form.personalCare) {
      const personalCare =
        step_two_form.personalCare as unknown as PersonalCareOutput;

      if (step_two_form?.personalCare?.id) {
        setValue(
          "bathroomIndependence",
          personalCare.client_name_used_bathroom_without_assistance === true
            ? "yes"
            : personalCare.client_name_used_bathroom_without_assistance ===
              false
            ? "no"
            : ""
        );
      }

      setValue("bathroomAssistance", [
        ...(personalCare.assisted_client_with_changing_diapers
          ? ["Changing diapers"]
          : []),
        ...(personalCare.assisted_client_with_toileting
          ? ["Assisting with toileting"]
          : []),
      ]);
      if (
        personalCare.other_bowel &&
        personalCare.other_specify_bowel &&
        personalCare.other_specify_bowel?.length > 0
      ) {
        setSelectOtherBowel(true);
        setValue("otherBowel", personalCare.other_specify_bowel || "");
      }

      if (
        !personalCare.assisted_client_with_changing_diapers &&
        !personalCare.assisted_client_with_toileting &&
        !personalCare.other_specify_bowel
      ) {
        setValue("bathroomAssistance", ["None"]);
      }

      setValue("hygieneSupport", [
        ...(personalCare.supported_client_with_bathing ? ["Bathing"] : []),
        ...(personalCare.supported_client_with_brushing_teeth
          ? ["Brushing teeth"]
          : []),
        ...(personalCare.supported_client_with_shampooing
          ? ["Shampooing"]
          : []),
        ...(personalCare.supported_client_with_toweling ? ["Toweling"] : []),
        ...(personalCare.supported_client_with_showering ? ["Showering"] : []),
        ...(personalCare.supported_client_with_menstrual_care
          ? ["Menstrual care"]
          : []),
      ]);
      if (
        personalCare.other_personal_hygiene &&
        personalCare.other_specify_personal_hygiene &&
        personalCare.other_specify_personal_hygiene?.length > 0
      ) {
        setSelectOtherHygiene(true);
        setValue(
          "otherHygiene",
          personalCare.other_specify_personal_hygiene || ""
        );
      }

      if (
        !personalCare.supported_client_with_bathing &&
        !personalCare.supported_client_with_brushing_teeth &&
        !personalCare.supported_client_with_shampooing &&
        !personalCare.supported_client_with_toweling &&
        !personalCare.supported_client_with_showering &&
        !personalCare.supported_client_with_menstrual_care &&
        !personalCare.other_specify_personal_hygiene
      ) {
        setValue("hygieneSupport", ["None"]);
      }
    }
  }, [step_two_form, setValue]);

  const onSubmit: SubmitHandler<PersonalCareFormData> = async (data) => {
    setLoading(true);
    const convertedData = convertPersonalCare(data);
    await submitPersonal(convertedData);
    setLoading(false);
  };

  const saveDraft = async () => {
    setLoading(true);

    const data = getValues();
    try {
      const convertedData = convertPersonalCare(data);
      await submitPersonal(convertedData, true);
    } finally {
      setLoading(false);
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
      const c = selectedValues.filter((item: string) => item !== "None");

      if (c.includes(value)) {
        setValue(
          fieldName,
          c.filter((item: string) => item !== value)
        );
      } else {
        setValue(fieldName, [...c, value]);
      }
    }
  };

  useEffect(() => {}, [errors]);

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3
        data-testid="personal-care-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Personal Care
      </h3>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            Did {username} use the bathroom without assistance?
          </h4>

          <Controller
            name="bathroomIndependence"
            control={control}
            render={({ field }) => (
              <RadioGroup
                disabled={isFormDisabled}
                onValueChange={(value) => field.onChange(value)}
                value={field.value}
                data-testid="bathroom-assistance-radio"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    data-testid="bathroom-assistance-radio-item-yes"
                    value="yes"
                    id="yes"
                  />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    data-testid="bathroom-assistance-radio-item-no"
                    value="no"
                    id="no"
                  />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I assisted {username} with the following bathroom activities:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4">
            {bathroomAssistanceOptions.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Controller
                  name="bathroomAssistance"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      disabled={isFormDisabled}
                      id={`bathroom_${idx}`}
                      checked={(field.value as string[]).includes(activity)}
                      onCheckedChange={() =>
                        handleCheckboxChange("bathroomAssistance", activity)
                      }
                      data-testid={`bathroom-assistance-${activity
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={`bathroom_${idx}`}
                >
                  {activity}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Checkbox
                disabled={isFormDisabled}
                id="other_bowel"
                checked={selectOtherBowel}
                onCheckedChange={(checked) => {
                  setSelectOtherBowel(checked === true);
                  if (!checked) {
                    setValue("otherBowel", undefined);
                  }
                }}
                data-testid={`bathroom-assistance-other`}
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
              {getErrorMessage(errors.bathroomAssistance)}
            </p>
          )}
        </div>

        {selectOtherBowel && (
          <Controller
            name="otherBowel"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormInput
                {...field}
                disabled={isFormDisabled}
                labelText=""
                placeholder="Please specify other bathroom assistance"
                type="text"
                isAuth={false}
                isError={!!errors.otherBowel}
                errorMessage={getErrorMessage(errors.otherBowel)}
                data-testid="other-bathroom-assistance"
              />
            )}
          />
        )}

        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} with the following hygiene activities:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4">
            {hygieneSupportOptions.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Controller
                  name="hygieneSupport"
                  disabled={isFormDisabled}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={`hygiene_${idx}`}
                      disabled={isFormDisabled}
                      checked={(field.value as string[]).includes(activity)}
                      onCheckedChange={() =>
                        handleCheckboxChange("hygieneSupport", activity)
                      }
                      data-testid={`hygiene-activity-${activity
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={`hygiene_${idx}`}
                >
                  {activity}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Checkbox
                id="other_hygiene"
                disabled={isFormDisabled}
                checked={selectOtherHygiene}
                onCheckedChange={(checked) => {
                  setSelectOtherHygiene(checked === true);
                  if (!checked) {
                    setValue("otherHygiene", undefined);
                  }
                }}
                data-testid={`hygiene-activity-other`}
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
              {getErrorMessage(errors.hygieneSupport)}
            </p>
          )}
        </div>

        {selectOtherHygiene && (
          <Controller
            name="otherHygiene"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormInput
                {...field}
                disabled={isFormDisabled}
                labelText=""
                placeholder="Please specify other hygiene support"
                type="text"
                isAuth={false}
                isError={!!errors.otherHygiene}
                errorMessage={getErrorMessage(errors.otherHygiene)}
                data-testid="other-hygiene-activity"
              />
            )}
          />
        )}

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%]">
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
            <Button
              type="submit"
              isLoading={loading}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default PersonalCare;
