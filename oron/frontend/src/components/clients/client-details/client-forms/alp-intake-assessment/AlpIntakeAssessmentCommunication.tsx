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
import FormTextArea from "@/components/input-fields/FormTextArea";
import { submitAlpCommunication } from "@/actions/clients/alp-form/intakeAssessment";

type OptionType<T extends keyof CommunicationFormData> = {
  id: keyof CommunicationFormData[T];
  label: string;
};

const PREFERRED_COMMUNICATION_OPTIONS: OptionType<"preferredCommunicationMethod">[] =
  [
    { id: "verbal", label: "Verbal" },
    { id: "nonVerbal", label: "Non-Verbal" },
    {
      id: "signLanguageWrittenCommunication",
      label: "Sign Language Written Communication",
    },
    { id: "visual", label: "Visual" },
    { id: "other", label: "Other" },
  ];

const AAC_METHOD_OPTIONS: OptionType<"aacMethod">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "speechGeneratingDevices", label: "Speech generating devices" },
  { id: "communicationBoards", label: "Communication boards" },
  { id: "communicationBooks", label: "Communication books" },
  { id: "manualSigning", label: "Manual signing" },
  { id: "gesture", label: "Gesture" },
  { id: "pecsCards", label: "PECs/Communication cards" },
  { id: "ipads", label: "iPads" },
  { id: "bodyLanguage", label: "Body language" },
  { id: "drawing", label: "Drawing" },
  { id: "fabFrenchayBoard", label: "FAB Frenchay alphabet board" },
  { id: "objectSymbols", label: "Object symbols" },
  { id: "poddBooks", label: "PODD books" },
  { id: "vocalizations", label: "Vocalizations" },
  { id: "other", label: "Other" },
];

const SUPPORTS_REQUIRED_OPTIONS: OptionType<"supportsRequired">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "signLanguage", label: "Sign language" },
  { id: "interpreters", label: "Interpreters" },
  { id: "other", label: "Other" },
];

const communicationSchema = z.object({
  preferredCommunicationMethod: z.object({
    verbal: z.boolean(),
    nonVerbal: z.boolean(),
    signLanguageWrittenCommunication: z.boolean(),
    visual: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
  }),
  aacMethod: z.object({
    notApplicable: z.boolean(),
    speechGeneratingDevices: z.boolean(),
    communicationBoards: z.boolean(),
    communicationBooks: z.boolean(),
    manualSigning: z.boolean(),
    gesture: z.boolean(),
    pecsCards: z.boolean(),
    ipads: z.boolean(),
    bodyLanguage: z.boolean(),
    drawing: z.boolean(),
    fabFrenchayBoard: z.boolean(),
    objectSymbols: z.boolean(),
    poddBooks: z.boolean(),
    vocalizations: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
  }),
  supportsRequired: z.object({
    notApplicable: z.boolean(),
    signLanguage: z.boolean(),
    interpreters: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
  }),
  potentialBarriers: z.string(),
  relatedInformation: z.string(),
  otherComments: z.string(),
});

type CommunicationFormData = z.infer<typeof communicationSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  isViewing?: boolean;
  isEditing?: boolean;
}

const AlpIntakeAssessmentCommunication = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  isViewing,
  isEditing,
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");

  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      preferredCommunicationMethod: {
        verbal: false,
        nonVerbal: false,
        signLanguageWrittenCommunication: false,
        visual: false,
        other: false,
        otherSpecify: "",
      },
      aacMethod: {
        notApplicable: false,
        speechGeneratingDevices: false,
        communicationBoards: false,
        communicationBooks: false,
        manualSigning: false,
        gesture: false,
        pecsCards: false,
        ipads: false,
        bodyLanguage: false,
        drawing: false,
        fabFrenchayBoard: false,
        objectSymbols: false,
        poddBooks: false,
        vocalizations: false,
        other: false,
        otherSpecify: "",
      },
      supportsRequired: {
        notApplicable: false,
        signLanguage: false,
        interpreters: false,
        other: false,
        otherSpecify: "",
      },
      potentialBarriers: "",
      relatedInformation: "",
      otherComments: "",
    },
  });

  const watchPreferredCommunicationOther = watch(
    "preferredCommunicationMethod.other"
  );
  const watchAACMethodOther = watch("aacMethod.other");
  const watchSupportsRequiredOther = watch("supportsRequired.other");

  const onSubmit = async (data: CommunicationFormData) => {
    try {
      // TODO: Implement submission logic

      const token = localStorage.getItem("token") as string;

      const requestBody: any = {};

      const { status, errorMessage } = await submitAlpCommunication(
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
      // TODO: Implement draft saving logic

      const token = localStorage.getItem("token") as string;

      const requestBody: any = {};

      const { status, errorMessage } = await submitAlpCommunication(
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
      <h3 className="text-[#0F172A] text-[24px] font-[600]">Communication</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 lg:min-w-[768px] md:min-w-full">
              {/* Headers */}
              <div className="grid grid-cols-3 p-4 border-b">
                <div>
                  <h4 className="text-[#0F172A] text-[16px] font-[500]">
                    Communication
                  </h4>
                </div>
                <div className="col-span-2">
                  <h4 className="text-[#0F172A] text-[16px] font-[500]">
                    Areas of support
                  </h4>
                </div>
              </div>

              <div className="divide-y">
                {/* Preferred Communication Method */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Preferred Communication Method
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {PREFERRED_COMMUNICATION_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={
                            `preferredCommunicationMethod.${option.id}` as const
                          }
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`preferredCommunication${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label
                                htmlFor={`preferredCommunication${option.id}`}
                              >
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchPreferredCommunicationOther && (
                        <Controller
                          name="preferredCommunicationMethod.otherSpecify"
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
                </div>

                {/* Augmentative And Alternative Communication (AAC) Method */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Augmentative And Alternative Communication (AAC) Method
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {AAC_METHOD_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`aacMethod.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`aacMethod${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`aacMethod${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchAACMethodOther && (
                        <Controller
                          name="aacMethod.otherSpecify"
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
                </div>

                {/* Supports Required For Communication */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Supports Required For Communication
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {SUPPORTS_REQUIRED_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`supportsRequired.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`supportsRequired${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`supportsRequired${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchSupportsRequiredOther && (
                        <Controller
                          name="supportsRequired.otherSpecify"
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
                </div>

                {/* Additional Text Areas */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Potential Barriers
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
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

                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Related information from other AW services
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
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

                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Other Comments
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
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

export default AlpIntakeAssessmentCommunication;
