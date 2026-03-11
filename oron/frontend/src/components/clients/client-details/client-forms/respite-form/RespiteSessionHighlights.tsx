"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import FormSelect from "@/components/input-fields/FormSelect";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitRespiteSessionHighlights } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  respiteForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const sessionHighlightsSchema = z.object({
  location: z.string().min(1, { message: "Please select a location" }),
  levelOfCompliance: z
    .string()
    .min(1, { message: "Please select level of compliance" }),
  injuryToSelf: z.string().min(1, { message: "Please select injury to self" }),
  aggressionToOthers: z
    .string()
    .min(1, { message: "Please select aggression to others" }),
  wasHospitalized: z.enum(["yes", "no"], {
    required_error: "Please select if client was hospitalized",
  }),
  placedInDanger: z.enum(["yes", "no"], {
    required_error: "Please select if client placed themselves in danger",
  }),
});

export type RespiteSessionHighlightsFormData = z.infer<
  typeof sessionHighlightsSchema
>;

const RespiteSessionHighlights = ({
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
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RespiteSessionHighlightsFormData>({
    resolver: zodResolver(sessionHighlightsSchema),
    defaultValues: {
      location: "",
      levelOfCompliance: "",
      injuryToSelf: "",
      aggressionToOthers: "",
      wasHospitalized: "no",
      placedInDanger: "no",
    },
  });

  useEffect(() => {
    if (!respiteForm?.sessionHighlights) return;

    setMethod("PATCH");
    const { sessionHighlights } = respiteForm;

    setValue("location", sessionHighlights.location || "");
    setValue("levelOfCompliance", sessionHighlights.level_of_compliance || "");
    setValue("injuryToSelf", sessionHighlights.injury_to_self || "");
    setValue(
      "aggressionToOthers",
      sessionHighlights.aggression_to_others || ""
    );
    setValue(
      "wasHospitalized",
      sessionHighlights.client_hospitalized_in_care_today ? "yes" : "no"
    );
    setValue(
      "placedInDanger",
      sessionHighlights.client_placed_themselves_in_harm_by_leaving_my_care
        ? "yes"
        : "no"
    );
  }, [respiteForm, setValue]);

  const onSubmit = async (data: RespiteSessionHighlightsFormData) => {
    try {
      const token = localStorage.getItem("token") as string;
      const response = await submitRespiteSessionHighlights(
        token,
        data,
        respiteForm?.id || "",
        method,
        respiteForm?.sessionHighlights?.id
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
      console.error("ERROR SUBMITTING SESSION HIGHLIGHTS", err);
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

      const response = await submitRespiteSessionHighlights(
        token,
        data,
        respiteForm?.id || "",
        method,
        respiteForm?.sessionHighlights?.id
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
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 static">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Session Highlights
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <FormSelect
                labelText="Location"
                placeholder="Please select"
                selectContent={[
                  { label: "Home", value: "Home" },
                  { label: "Community", value: "Community" },
                  { label: "Home & Community", value: "Home & Community" },
                  { label: "Virtual Session", value: "Virtual Session" },
                ]}
                onValueChange={field.onChange}
                value={field.value}
                disabled={isFormDisabled}
                isError={!!errors.location}
                errorMessage={errors.location?.message}
              />
            )}
          />

          <Controller
            name="levelOfCompliance"
            control={control}
            render={({ field }) => (
              <FormSelect
                labelText="Level Of compliance"
                placeholder="Please select"
                selectContent={[
                  {
                    label: "Seemed distant/ distracted",
                    value: "Seemed distant/ distracted",
                  },
                  {
                    label: "Seemed mostly annoyed and/or combative",
                    value: "Seemed mostly annoyed and/or combative",
                  },
                  {
                    label: "Seemed mostly silly and/or overactive",
                    value: "Seemed mostly silly and/or overactive",
                  },
                  {
                    label: "Seemed willing to participate",
                    value: "Seemed willing to participate",
                  },
                  {
                    label: "Seemed eager to participate",
                    value: "Seemed eager to participate",
                  },
                ]}
                onValueChange={field.onChange}
                value={field.value}
                disabled={isFormDisabled}
                isError={!!errors.levelOfCompliance}
                errorMessage={errors.levelOfCompliance?.message}
              />
            )}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="injuryToSelf"
            control={control}
            render={({ field }) => (
              <FormSelect
                labelText="Injury to self"
                placeholder="Please select"
                selectContent={[
                  { label: "No Events", value: "No Events" },
                  { label: "1 - 3", value: "1 - 3" },
                  { label: "4 - 7", value: "4 - 7" },
                  { label: "7 - 20", value: "7 - 20" },
                  { label: "20+", value: "20+" },
                ]}
                onValueChange={field.onChange}
                value={field.value}
                disabled={isFormDisabled}
                isError={!!errors.injuryToSelf}
                errorMessage={errors.injuryToSelf?.message}
              />
            )}
          />

          <Controller
            name="aggressionToOthers"
            control={control}
            render={({ field }) => (
              <FormSelect
                labelText="Aggression to others"
                placeholder="Please select"
                selectContent={[
                  { label: "No Events", value: "No Events" },
                  { label: "1 - 3", value: "1 - 3" },
                  { label: "4 - 7", value: "4 - 7" },
                  { label: "7 - 20", value: "7 - 20" },
                  { label: "20+", value: "20+" },
                ]}
                onValueChange={field.onChange}
                value={field.value}
                disabled={isFormDisabled}
                isError={!!errors.aggressionToOthers}
                errorMessage={errors.aggressionToOthers?.message}
              />
            )}
          />
        </div>

        <Controller
          name="wasHospitalized"
          control={control}
          render={({ field }) => (
            <RadioGroup
              className="flex flex-col gap-5"
              onValueChange={field.onChange}
              value={field.value}
              disabled={isFormDisabled}
            >
              <h4 className="text-[16px] font-[400] text-[#09090B]">
                {username} was hospitalized while in my care today
              </h4>
              <div className="flex items-center flex-wrap gap-5">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="hospitalized_yes" value="yes" />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="hospitalized_yes"
                  >
                    Yes
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem id="hospitalized_no" value="no" />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="hospitalized_no"
                  >
                    No
                  </Label>
                </div>
              </div>
              {errors.wasHospitalized && (
                <span className="text-red-500">
                  {errors.wasHospitalized.message}
                </span>
              )}
            </RadioGroup>
          )}
        />

        <Controller
          name="placedInDanger"
          control={control}
          render={({ field }) => (
            <RadioGroup
              className="flex flex-col gap-5"
              onValueChange={field.onChange}
              value={field.value}
              disabled={isFormDisabled}
            >
              <h4 className="text-[16px] font-[400] text-[#09090B]">
                {username} placed themselves in danger by walking or running
                away while in my care
              </h4>
              <div className="flex items-center flex-wrap gap-5">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="danger_yes" value="yes" />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="danger_yes"
                  >
                    Yes
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem id="danger_no" value="no" />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="danger_no"
                  >
                    No
                  </Label>
                </div>
              </div>
              {errors.placedInDanger && (
                <span className="text-red-500">
                  {errors.placedInDanger.message}
                </span>
              )}
            </RadioGroup>
          )}
        />

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
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
              data-testid="save-draft-button"
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              onClick={() => handleChangeIndex(currentIndex + 1)}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              data-testid="next-section-button"
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

export default RespiteSessionHighlights;
