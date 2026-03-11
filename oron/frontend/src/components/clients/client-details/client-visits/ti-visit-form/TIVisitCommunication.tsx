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
  { label: "Objects", value: "objects" },
  { label: "Icons/Pictures", value: "icons_pictures" },
  { label: "Short sentences (3-5 words)", value: "short_sentences" },
  { label: "Elaborate sentences (5+ words)", value: "elaborate_sentences" },
  {
    label: "An augmentative communication device",
    value: "an_augmentative_communication_device",
  },
  { label: "Single words", value: "single_words" },
  { label: "Written words", value: "written_words" },
  { label: "Short phrases", value: "short_phrases" },
  { label: "Verbal sounds", value: "verbal_sounds" },
  { label: "Photographs", value: "photographs" },
  {
    label: "The picture exchange communication system",
    value: "picture_exchange_communication_system",
  },
  {
    label: "Picture communication symbols",
    value: "picture_communication_symbols",
  },
  { label: "Repititive phrases", value: "repetitive_phrases" },
  { label: "Typed words", value: "typed_words" },
  { label: "Sign language", value: "sign_language" },
  { label: "Other", value: "other" },
] as const;

const interpretationLabels = [
  { label: "Stated an opinion", value: "stated_an_opinion" },
  { label: "Showed appreciation", value: "showed_appreciation" },
  { label: "Expressed happiness", value: "expressed_happiness" },
  {
    label: "Expressed a sense of humour/joking",
    value: "expressed_sense_of_humour_joking",
  },
  {
    label: "Showed a desire for a tangible object",
    value: "showed_desire_for_tangible_object",
  },
  { label: "Indicated worry/anxiety", value: "indicated_worry_anxiety" },
  { label: "Indicated curiousity", value: "indicated_curiousity" },
  { label: "Made a comment", value: "made_a_comment" },
  { label: "Showed praise", value: "showed_praise" },
  {
    label: "Attempted to escape from an activity",
    value: "attempted_escape_from_activity",
  },
  { label: "Was being silly", value: "was_being_silly" },
  { label: "Protested", value: "protested" },
  { label: "Asked a question", value: "asked_a_question" },
  { label: "Initiated conversation", value: "initiated_conversation" },
  { label: "Other", value: "other_interpretation" },
] as const;

const communicationSchema = z.object({
  responses: z.record(z.boolean()).refine(
    (data) => {
      // Count true values
      const trueCount = Object.values(data).filter(Boolean).length;
      // Exactly two options should be selected
      return trueCount === 2;
    },
    {
      message: "Please select exactly two communication methods",
    }
  ),
  interpretations: z.record(z.boolean()),
  other_description: z.string().optional().nullable(),
  other_interpretation_description: z.string().optional().nullable(),
});

type CommunicationFormData = z.infer<typeof communicationSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  tiForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
  handleChangeStep: (newStep: number) => void;
}

const TIVisitCommunication = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  tiForm,
  isViewing,
  isEditing,
  username = "Client",
  handleChangeStep,
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
      interpretations: Object.fromEntries(
        interpretationLabels.map(({ value }) => [value, false])
      ),
      other_description: "",
      other_interpretation_description: "",
    },
  });

  const watchOther = watch("responses.other");
  const watchOtherInterpretation = watch(
    "interpretations.other_interpretation"
  );

  useEffect(() => {
    if (!tiForm?.communication) return;

    setMethod("PATCH");
    const { communication } = tiForm;

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

    // Set interpretation values
    // setValue(
    //   "interpretations.stated_an_opinion",
    //   Boolean(communication.stated_an_opinion)
    // );
    // setValue(
    //   "interpretations.showed_appreciation",
    //   Boolean(communication.showed_appreciation)
    // );
    // setValue(
    //   "interpretations.expressed_happiness",
    //   Boolean(communication.expressed_happiness)
    // );
    // setValue(
    //   "interpretations.expressed_sense_of_humour_joking",
    //   Boolean(communication.expressed_sense_of_humour_joking)
    // );
    // setValue(
    //   "interpretations.showed_desire_for_tangible_object",
    //   Boolean(communication.showed_desire_for_tangible_object)
    // );
    // setValue(
    //   "interpretations.indicated_worry_anxiety",
    //   Boolean(communication.indicated_worry_anxiety)
    // );
    // setValue(
    //   "interpretations.indicated_curiousity",
    //   Boolean(communication.indicated_curiousity)
    // );
    // setValue(
    //   "interpretations.made_a_comment",
    //   Boolean(communication.made_a_comment)
    // );
    // setValue(
    //   "interpretations.showed_praise",
    //   Boolean(communication.showed_praise)
    // );
    // setValue(
    //   "interpretations.attempted_escape_from_activity",
    //   Boolean(communication.attempted_escape_from_activity)
    // );
    // setValue(
    //   "interpretations.was_being_silly",
    //   Boolean(communication.was_being_silly)
    // );
    // setValue("interpretations.protested", Boolean(communication.protested));
    // setValue(
    //   "interpretations.asked_a_question",
    //   Boolean(communication.asked_a_question)
    // );
    // setValue(
    //   "interpretations.initiated_conversation",
    //   Boolean(communication.initiated_conversation)
    // );
    // setValue(
    //   "interpretations.other_interpretation",
    //   Boolean(communication.other_interpretation)
    // );

    // Set descriptions if they exist
    if (communication.other) {
      setValue("other_description", communication.other_description || "");
    }
    // if (communication.other_interpretation) {
    //   setValue(
    //     "other_interpretation_description",
    //     communication.other_interpretation_description || ""
    //   );
    // }
  }, [tiForm, setValue]);

  const handleCheckboxChange = (value: string, checked: CheckedState) => {
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
        typed_words: data.responses.typed_words,
        single_words: data.responses.single_words,
        photographs: data.responses.photographs,
        sign_language: data.responses.sign_language,
        an_augmentative_communication_device:
          data.responses.an_augmentative_communication_device,
        picture_exchange_communication_system:
          data.responses.picture_exchange_communication_system,
        other: data.responses.other,
        other_description: data.responses.other ? data.other_description : null,
        // Interpretation data
        stated_an_opinion: data.interpretations.stated_an_opinion,
        showed_appreciation: data.interpretations.showed_appreciation,
        expressed_happiness: data.interpretations.expressed_happiness,
        expressed_sense_of_humour_joking:
          data.interpretations.expressed_sense_of_humour_joking,
        showed_desire_for_tangible_object:
          data.interpretations.showed_desire_for_tangible_object,
        indicated_worry_anxiety: data.interpretations.indicated_worry_anxiety,
        indicated_curiousity: data.interpretations.indicated_curiousity,
        made_a_comment: data.interpretations.made_a_comment,
        showed_praise: data.interpretations.showed_praise,
        attempted_escape_from_activity:
          data.interpretations.attempted_escape_from_activity,
        was_being_silly: data.interpretations.was_being_silly,
        protested: data.interpretations.protested,
        asked_a_question: data.interpretations.asked_a_question,
        initiated_conversation: data.interpretations.initiated_conversation,
        other_interpretation: data.interpretations.other_interpretation,
        other_interpretation_description: data.interpretations
          .other_interpretation
          ? data.other_interpretation_description
          : null,
      };

      const response = await submitRespiteCommunication(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.communication?.id
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleChangeStep(2);
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
        typed_words: data.responses.typed_words,
        single_words: data.responses.single_words,
        photographs: data.responses.photographs,
        sign_language: data.responses.sign_language,
        an_augmentative_communication_device:
          data.responses.an_augmentative_communication_device,
        picture_exchange_communication_system:
          data.responses.picture_exchange_communication_system,
        other: data.responses.other,
        other_description: data.responses.other ? data.other_description : null,
        // Interpretation data
        stated_an_opinion: data.interpretations.stated_an_opinion,
        showed_appreciation: data.interpretations.showed_appreciation,
        expressed_happiness: data.interpretations.expressed_happiness,
        expressed_sense_of_humour_joking:
          data.interpretations.expressed_sense_of_humour_joking,
        showed_desire_for_tangible_object:
          data.interpretations.showed_desire_for_tangible_object,
        indicated_worry_anxiety: data.interpretations.indicated_worry_anxiety,
        indicated_curiousity: data.interpretations.indicated_curiousity,
        made_a_comment: data.interpretations.made_a_comment,
        showed_praise: data.interpretations.showed_praise,
        attempted_escape_from_activity:
          data.interpretations.attempted_escape_from_activity,
        was_being_silly: data.interpretations.was_being_silly,
        protested: data.interpretations.protested,
        asked_a_question: data.interpretations.asked_a_question,
        initiated_conversation: data.interpretations.initiated_conversation,
        other_interpretation: data.interpretations.other_interpretation,
        other_interpretation_description: data.interpretations
          .other_interpretation
          ? data.other_interpretation_description
          : null,
      };

      const response = await submitRespiteCommunication(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.communication?.id
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

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <p className="text-[18px] font-[600] text-[#0F172A]">
            Two primary ways {username} communicated with me
          </p>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {responseLabels.map(({ label, value }) => (
              <div key={value} className="flex items-center gap-2">
                <Controller
                  name={
                    `responses.${value}` as FieldPath<CommunicationFormData>
                  }
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
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-[18px] font-[600] text-[#0F172A]">
            When {username} communicated with me, I interpreted that he/she
          </p>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {interpretationLabels.map(({ label, value }) => (
              <div key={value} className="flex items-center gap-2">
                <Controller
                  name={
                    `interpretations.${value}` as FieldPath<CommunicationFormData>
                  }
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={value}
                      checked={field.value as CheckedState}
                      onCheckedChange={(checked: CheckedState) =>
                        setValue(
                          `interpretations.${value}` as FieldPath<CommunicationFormData>,
                          checked === true
                        )
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

          {watchOtherInterpretation && (
            <Controller
              name="other_interpretation_description"
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
        </div>

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

export default TIVisitCommunication;
