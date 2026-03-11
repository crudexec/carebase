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
import { toast } from "@/components/ui/use-toast";
import { submitRespiteCommunication } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

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
  { label: "Typed words", value: "typed_words" },
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

const communicationSchema = z.object({
  responses: z.record(z.boolean()).refine(
    (data) => {
      // Count true values
      const trueCount = Object.values(data).filter(Boolean).length;
      // If none is selected, no other options should be selected
      if (data.none)
        return Object.entries(data).every(([key, value]) =>
          key === "none" ? value : !value
        );
      // If other options are selected, exactly two should be selected
      return trueCount === 2;
    },
    {
      message:
        "Please select exactly two communication methods, or 'None of the above'",
    }
  ),
  other_description: z.string().optional().nullable(),
});

type CommunicationFormData = z.infer<typeof communicationSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  respiteForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const RespiteCommunication = ({
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
  } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      responses: Object.fromEntries(
        responseLabels.map(({ value }) => [value, false])
      ),
      other_description: "",
    },
  });

  const watchNone = watch("responses.none");
  const watchOther = watch("responses.other");

  useEffect(() => {
    if (!respiteForm?.communication) return;

    setMethod("PATCH");
    const { communication } = respiteForm;

    // Set checkbox values from API response
    setValue("responses.gestures", Boolean(communication.gestures));
    setValue("responses.written_words", Boolean(communication.written_words));
    setValue(
      "responses.picture_communication_symbols",
      Boolean(communication.picture_communication_symbols)
    );
    setValue("responses.objects", Boolean(communication.objects));
    setValue("responses.short_phrases", Boolean(communication.short_phrases));
    setValue(
      "responses.repetitive_phrases",
      Boolean(communication.repetitive_phrases)
    );
    setValue("responses.icons_pictures", Boolean(communication.icons_pictures));
    setValue("responses.verbal_sounds", Boolean(communication.verbal_sounds));
    setValue("responses.typed_words", Boolean(communication.type_words));
    setValue("responses.single_words", Boolean(communication.single_words));
    setValue("responses.photographs", Boolean(communication.photographs));
    setValue("responses.sign_language", Boolean(communication.sign_language));
    setValue(
      "responses.an_augmentative_communication_device",
      Boolean(communication.an_augmentative_communication_device)
    );
    setValue(
      "responses.picture_exchange_communication_system",
      Boolean(communication.picture_exchange_communication_system)
    );
    setValue("responses.other", Boolean(communication.other));
    setValue("responses.none", false);

    // Set other description if exists
    if (communication.other) {
      setValue("other_description", communication.other_description || "");
    }
  }, [respiteForm, setValue]);

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

  const onSubmit = async (data: CommunicationFormData) => {
    try {
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        gestures: data.responses.gestures,
        written_words: data.responses.written_words,
        picture_communication_symbols:
          data.responses.picture_communication_symbols,
        objects: data.responses.objects,
        short_phrases: data.responses.short_phrases,
        repetitive_phrases: data.responses.repetitive_phrases,
        icons_pictures: data.responses.icons_pictures,
        verbal_sounds: data.responses.verbal_sounds,
        type_words: data.responses.typed_words,
        single_words: data.responses.single_words,
        photographs: data.responses.photographs,
        sign_language: data.responses.sign_language,
        an_augmentative_communication_device:
          data.responses.an_augmentative_communication_device,
        picture_exchange_communication_system:
          data.responses.picture_exchange_communication_system,
        other: data.responses.other,
        other_description: data.responses.other ? data.other_description : null,
      };

      const response = await submitRespiteCommunication(
        token,
        transformedData,
        respiteForm?.id || "",
        method,
        respiteForm?.communication?.id
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
      console.error("ERROR SUBMITTING COMMUNICATION", err);
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
        gestures: data.responses.gestures,
        written_words: data.responses.written_words,
        picture_communication_symbols:
          data.responses.picture_communication_symbols,
        objects: data.responses.objects,
        short_phrases: data.responses.short_phrases,
        repetitive_phrases: data.responses.repetitive_phrases,
        icons_pictures: data.responses.icons_pictures,
        verbal_sounds: data.responses.verbal_sounds,
        type_words: data.responses.typed_words,
        single_words: data.responses.single_words,
        photographs: data.responses.photographs,
        sign_language: data.responses.sign_language,
        an_augmentative_communication_device:
          data.responses.an_augmentative_communication_device,
        picture_exchange_communication_system:
          data.responses.picture_exchange_communication_system,
        other: data.responses.other,
        other_description: data.responses.other ? data.other_description : null,
      };

      const response = await submitRespiteCommunication(
        token,
        transformedData,
        respiteForm?.id || "",
        method,
        respiteForm?.communication?.id
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
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Communication / Self Direction
      </h3>

      <p className="text-[18px] font-[600] text-[#0F172A]">
        Two primary ways {username} communicated with me
      </p>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
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
                disabled={isFormDisabled}
              />
            )}
          />
        )}

        {errors?.responses && (
          <p className="text-red-700">
            {String(
              errors.responses?.message || errors.responses?.root?.message
            )}
          </p>
        )}

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

export default RespiteCommunication;
