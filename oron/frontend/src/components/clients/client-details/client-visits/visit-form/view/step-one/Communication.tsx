"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, FieldPath } from "react-hook-form";
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
import useVisitingFormSubmission from "../../logic";
import { COMMUNICATION } from "../../store/reducer";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { communicationSchema } from "../../logic/schema";
import { checkFormData } from "@/utils/helpers";
import { toast } from "@/components/ui/use-toast";

type CheckedState = boolean | "indeterminate";

const responseLabels = [
  { label: "Gestures", value: "gestures" },
  { label: "Written words", value: "written_words" },
  {
    label: "Picture communication symbols",
    value: "picture_communication_symbols",
  },
  { label: "Objects", value: "objects" },
  { label: "Short phrases", value: "short_phrases" },
  { label: "Repetitive phrases", value: "repetitive_phrases" },
  { label: "Icons/Pictures", value: "icons_pictures" },
  { label: "Verbal sounds", value: "verbal_sounds" },
  { label: "Typed words", value: "type_words" },
  { label: "Single words", value: "single_words" },
  { label: "Photographs", value: "photographs" },
  { label: "Sign language", value: "sign_language" },
  {
    label: "An augmentative communication device",
    value: "an_augmentative_communication_device",
  },
  {
    label: "The picture exchange communication system",
    value: "picture_exchange_communication_system",
  },
  { label: "Other", value: "other" },
  { label: "None of the above", value: "none" },
] as const;

type ResponseLabel = (typeof responseLabels)[number];

type CommunicationFormData = z.infer<typeof communicationSchema>;

interface CommunicationProps {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  handleChangeStep: (d: number) => void;
  admin?: boolean;
}

const Communication: React.FC<CommunicationProps> = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  handleChangeStep,
  admin,
}) => {
  const { submitCommunication } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    handleChangeStep
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      responses: Object.fromEntries(
        responseLabels.map(({ value }) => [value, false])
      ),
      other_description: "",
    },
  });

  const { state } = useVisitingFormContext();
  const { isFormDisabled: stateDis } = state;
  const isFormDisabled = stateDis;

  const watchNone = watch("responses.none");

  useEffect(() => {
    const formData: COMMUNICATION = state.step_one_form.communication;

    if (formData.id && checkFormData(formData, responseLabels) === false) {
      setValue("responses.none", true);
    }
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === "boolean") {
          setValue(
            `responses.${key}` as FieldPath<CommunicationFormData>,
            value
          );
        } else {
          setValue(key as FieldPath<CommunicationFormData>, value);
        }
      }
    });
  }, [setValue, state.step_one_form.communication]);

  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (data: CommunicationFormData) => {
    setLoading(true);
    await submitCommunication(data as unknown as COMMUNICATION);
    setLoading(false);
  });

  const saveDraft = async () => {
    setLoading(true);
    try {
      await submitCommunication(getValues() as unknown as COMMUNICATION, true);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const watchOther = watch("responses.other");

  const handleCheckboxChange = (value: string, checked: CheckedState) => {
    if (value === "none" && checked) {
      responseLabels.forEach((item) => {
        if (item.value !== "none") {
          setValue(
            `responses.${item.value}` as FieldPath<CommunicationFormData>,
            false
          );
        }
      });
    } else if (value !== "none") {
      setValue("responses.none" as FieldPath<CommunicationFormData>, false);
    }

    setValue(
      `responses.${value}` as FieldPath<CommunicationFormData>,
      checked === true
    );
  };

  useEffect(() => {
    if (errors.responses) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);
  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3
        data-testid="communication-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Communication / Self Direction
      </h3>

      <p className="text-[18px] font-[600] text-[#0F172A]">
        Two primary ways {username} communicated with me
      </p>

      <form className="flex flex-col gap-7" onSubmit={onSubmit}>
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
          {responseLabels.map(({ label, value }) => (
            <div key={value} className="flex items-center gap-2">
              <Controller
                name={`responses.${value}` as FieldPath<CommunicationFormData>}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id={value}
                    checked={field.value as CheckedState}
                    onCheckedChange={(checked: CheckedState) =>
                      handleCheckboxChange(value, checked)
                    }
                    disabled={isFormDisabled}
                    data-testid={`client-communicated-${value}`}
                  />
                )}
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

        {watchOther && (
          <Controller
            name="other_description"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                value={field.value === null ? "" : field.value}
                labelText=""
                placeholder="Please specify"
                type="text"
                isAuth={false}
              />
            )}
          />
        )}

        <p className="text-red-700">{errors?.responses?.responses?.message}</p>

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
                handleNewCompletedSection(currentIndex);
                if (handleChangeStep) {
                  handleChangeStep(2);
                }
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

export default Communication;
