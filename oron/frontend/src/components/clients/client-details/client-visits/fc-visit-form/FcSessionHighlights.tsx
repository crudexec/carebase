"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import FormSelect from "@/components/input-fields/FormSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "@/constants";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import FormInput from "@/components/input-fields/FormInput";
import { submitSessionHighlightsForm } from "@/actions/clients/fc-visit/sessionHighlights";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { FullFcVisitForm } from "@/types/Visit";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  formId: string;
  visitForms: FullFcVisitForm | undefined;
}

const sessionHighlightsSchema = z.object({
  sessionCountry: z.string().min(1, { message: "Please select a country." }),
  peoplePresent: z
    .array(z.string())
    .min(1, "At least one person must be selected."),
  other_description: z.string().optional().nullable(),
});

export type SessionHighlightsFormData = z.infer<typeof sessionHighlightsSchema>;

const FcSessionHighlights = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  formId,
  visitForms,
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = false;

  const peoplePresentOptions = [
    { label: "Mom", value: "mom" },
    { label: "Dad", value: "dad" },
    { label: "Brother", value: "brother" },
    { label: "Sister", value: "sister" },
    { label: "Grandma", value: "grandma" },
    { label: "Grandpa", value: "grandpa" },
    { label: "Guardian", value: "guardian" },
    { label: "Foster Mom", value: "foster_mom" },
    { label: "Step Mom", value: "step_mom" },
    { label: "Step Dad", value: "step_dad" },
    { label: "Other", value: "other" },
  ] as const;

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SessionHighlightsFormData>({
    resolver: zodResolver(sessionHighlightsSchema),
    defaultValues: {
      sessionCountry: "",
      peoplePresent: [],
      other_description: null,
    },
  });

  const peoplePresent = watch("peoplePresent");

  useEffect(() => {
    if (!visitForms) return;

    const { data } = visitForms;
    const { sessionHighlights } = data;

    if (sessionHighlights && Object.keys(sessionHighlights)?.length > 0) {
      setMethod("PATCH");

      setValue("sessionCountry", sessionHighlights?.session_ocurred_in ?? "");
      setValue(
        "peoplePresent",
        sessionHighlights?.those_present_for_the_family_consultant_session ?? []
      );

      if (
        sessionHighlights?.those_present_for_the_family_consultant_session
          ?.length === 0
      ) {
        setValue("peoplePresent", ["other"]);
      }
    }
  }, [visitForms, setValue]);

  const onSubmit = async (data: SessionHighlightsFormData) => {
    try {
      const token = localStorage.getItem("token") as string;
      const response = await submitSessionHighlightsForm(
        token,
        data,
        formId,
        visitForms?.data?.sessionHighlights?.id ?? "-",
        method
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
      console.error("ERROR SUBMITTING FC VISIT SESSION HIGHLIGHTS", err);
    }
  };

  const handleDraftSubmit = async () => {
    const data = getValues();
    try {
      setIsSubmittingDraft(true);
      const token = localStorage.getItem("token") as string;
      const response = await submitSessionHighlightsForm(
        token,
        data,
        formId,
        visitForms?.data?.sessionHighlights?.id ?? "-",
        method
      );

      if (response.status) {
        toast({
          variant: "success",
          description: "Draft saved successfully",
        });
      }
    } catch (err) {
      console.error("ERROR SUBMITTING FC VISIT SESSION HIGHLIGHTS", err);
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 static">
      <h3
        data-testid="fc-session-highlights-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Session Highlights
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <Controller
          name="sessionCountry"
          control={control}
          render={({ field }) => (
            <FormSelect
              labelText="This session occured in"
              placeholder="Please select"
              onValueChange={field.onChange}
              selectContent={[
                { label: "Home", value: "Home" },
                { label: "Community", value: "Community" },
                { label: "Home & Community", value: "Home & Community" },
                { label: "Virtual Session", value: "Virtual Session" },
              ]}
              isError={!!errors.sessionCountry}
              errorMessage={errors.sessionCountry?.message || ""}
              value={field.value}
              disabled={isFormDisabled}
              data-testid="fc-session-occurred"
            />
          )}
        />

        <div className="flex flex-col gap-2">
          <p
            data-testid="fc-people-present-header"
            className="text-[16px] font-[600] text-[#09090B]"
          >
            Those present for the Family Consultation session
          </p>
          <Controller
            name="peoplePresent"
            control={control}
            render={({ field }) => (
              <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
                {peoplePresentOptions.map(({ label, value }) => (
                  <div key={value} className="flex items-center gap-2">
                    <Checkbox
                      id={value}
                      checked={field.value.includes(value)}
                      onCheckedChange={(checked) => {
                        let newValue;
                        if (value === "other") {
                          newValue = checked
                            ? [value]
                            : field.value.filter((v) => v !== value);
                        } else {
                          newValue = checked
                            ? [
                                ...field.value.filter((v) => v !== "other"),
                                value,
                              ]
                            : field.value.filter((v) => v !== value);
                        }
                        field.onChange(newValue);
                      }}
                      disabled={isFormDisabled}
                      data-testid={`fc-people-present-${value}`}
                    />
                    <Label
                      className="text-[14px] font-[400] text-[#09090B]"
                      htmlFor={value}
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          />

          {errors.peoplePresent && (
            <span className="text-red-500 text-sm">
              {errors.peoplePresent.message}
            </span>
          )}
        </div>

        {peoplePresent.includes("other") && (
          <Controller
            name="other_description"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                value={field.value === null ? "" : field.value}
                labelText="Other Description"
                placeholder="Please specify"
                type="text"
                isAuth={false}
                data-testid="fc-other-description"
              />
            )}
          />
        )}

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
              onClick={handleDraftSubmit}
              variant="light"
              type="button"
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
              data-testid="save-draft-button"
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
              disabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
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

export default FcSessionHighlights;
