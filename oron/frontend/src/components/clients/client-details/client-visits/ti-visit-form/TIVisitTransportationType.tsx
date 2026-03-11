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
import { useEffect, useState, useMemo } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { generateTimeSlots, filterEndTimeOptions } from "@/utils/date-utils";
import { submitTiVisitTransportationType } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";
interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  tiForm?: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const safetyObjectivesList = [
  {
    label: "transitioned into the vehicle in a safe manner",
    value: "safe_transition_in",
  },
  {
    label: "entered the vehicle without behaviors",
    value: "entered_without_behaviors",
  },
  {
    label: "stayed safe during transportation by wearing a seat belt",
    value: "wearing_seatbelt",
  },
  {
    label: "stayed safe during transportation by remaining seated",
    value: "remaining_seated",
  },
  {
    label: "refrained from playing with the door/window of vehicle",
    value: "refrained_door_window",
  },
  {
    label:
      "transitioned out of the vehicle in a safe manner by waiting until the vehicle is parked",
    value: "safe_transition_out",
  },
];

const trafficSignsList = [
  {
    label: "identified red traffic light to indicate STOP",
    value: "red_light",
  },
  {
    label:
      "identified yellow traffic light to indicate warning that the signal will be changing from green to red",
    value: "yellow_light",
  },
  {
    label: "identified green traffic light to indicate it was time to go",
    value: "green_light",
  },
  {
    label: "identified pedestrian cross walk",
    value: "pedestrian_cross",
  },
  {
    label: "identified pedestrian signals",
    value: "pedestrian_signals",
  },
];

const directionalConceptsList = [
  {
    label: "indicated correct turns to make",
    value: "correct_turns",
  },
  {
    label: "identified some landmarks on the way",
    value: "landmarks",
  },
  {
    label: "identified and named street/address",
    value: "street_address",
  },
  {
    label: "identified the destination",
    value: "destination",
  },
  {
    label: "recalled the destination address",
    value: "destination_address",
  },
];

const promptTypes = [
  { label: "Verbal prompts", value: "verbal" },
  { label: "Physical prompts", value: "physical" },
  { label: "Visual prompts", value: "visual" },
];

const unusualOccurrencesList = [
  {
    label: "The vehicle was pulled over due to [client's name]'s behavior",
    value: "behavior",
  },
  {
    label: "The vehicle was pulled to attend to [client's name]'s needs",
    value: "needs",
  },
  {
    label: "There was traffic on the way while attending to [client's name]",
    value: "traffic",
  },
  {
    label: "Other",
    value: "other",
  },
];

const transportationSchema = z.object({
  dropOffLocation: z
    .string()
    .min(1, { message: "Please select drop off location" }),
  whoDroppedOff: z
    .string()
    .min(1, { message: "Please select who dropped off" }),
  startTime: z.string().min(1, { message: "Please select start time" }),
  endTime: z.string().min(1, { message: "Please select end time" }),
  startLocation: z.string().min(1, { message: "Please enter start location" }),
  endingLocation: z
    .string()
    .min(1, { message: "Please enter ending location" }),
  safetyObjectives: z
    .array(
      z.object({
        checked: z.boolean(),
        promptType: z.string().optional(),
      })
    )
    .refine(
      (data) => {
        const selectedCount = data.filter((item) => item.checked).length;
        return selectedCount >= 4;
      },
      {
        message: "Please select at least 4 safety objectives",
      }
    ),
  unusualOccurrence: z.object({
    occurred: z.boolean(),
    reasons: z.array(z.string()),
    otherReason: z.string().optional().nullable(),
  }),
  trafficSigns: z.array(
    z.object({
      checked: z.boolean(),
      promptType: z.string().optional(),
    })
  ),
  directionalConcepts: z.array(
    z.object({
      checked: z.boolean(),
      promptType: z.string().optional(),
    })
  ),
});

type TransportationFormData = z.infer<typeof transportationSchema>;

const TIVisitTransportationType = ({
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
  const timeOptions = useMemo(() => generateTimeSlots(), []);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransportationFormData>({
    // resolver: zodResolver(transportationSchema),
    defaultValues: {
      dropOffLocation: "",
      whoDroppedOff: "",
      startTime: "",
      endTime: "",
      startLocation: "",
      endingLocation: "",
      safetyObjectives: safetyObjectivesList.map(() => ({
        checked: false,
        promptType: "verbal",
      })),
      unusualOccurrence: {
        occurred: false,
        reasons: [],
        otherReason: "",
      },
      trafficSigns: trafficSignsList.map(() => ({ checked: false })),
      directionalConcepts: directionalConceptsList.map(() => ({
        checked: false,
      })),
    },
  });

  const startTime = watch("startTime");
  const endTime = watch("endTime");

  const calculateTimeDifference = (start: string, end: string) => {
    if (!start || !end) return { hours: 0, minutes: 0 };

    // Convert 12-hour format to 24-hour format
    const convertTo24Hour = (time: string) => {
      const [timePart, meridiem] = time.toLowerCase().split(/\s*(am|pm)\s*/i);
      let [hours, minutes] = timePart.split(":").map(Number);

      if (meridiem?.toLowerCase() === "pm" && hours !== 12) {
        hours += 12;
      } else if (meridiem?.toLowerCase() === "am" && hours === 12) {
        hours = 0;
      }

      return { hours, minutes: minutes || 0 };
    };

    const startTime = convertTo24Hour(start);
    const endTime = convertTo24Hour(end);

    let hours = endTime.hours - startTime.hours;
    let minutes = endTime.minutes - startTime.minutes;

    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }

    // Handle cases where end time is on the next day
    if (hours < 0) {
      hours += 24;
    }

    return { hours, minutes };
  };

  const timeDifference = calculateTimeDifference(startTime, endTime);

  useEffect(() => {
    if (!tiForm?.transportationTypeAndObjectives) return;

    setMethod("PATCH");
    const { transportationTypeAndObjectives } = tiForm;

    // Set form values from existing data
    if (transportationTypeAndObjectives.transportation_type_details) {
      const details =
        transportationTypeAndObjectives.transportation_type_details;
      setValue("dropOffLocation", details.whereWasDroppedOff || "");
      setValue("whoDroppedOff", details.whoDroppedOff || "");
      setValue("startTime", details.transportationStartTime || "");
      setValue("endTime", details.transportationEndTime || "");
      setValue("startLocation", details.startLocation || "");
      setValue("endingLocation", details.endingLocation || "");
    }

    // Set safety objectives
    if (transportationTypeAndObjectives.transportation_safety_objectives) {
      const safetyObjs =
        transportationTypeAndObjectives.transportation_safety_objectives;
      safetyObjs.forEach((obj, index) => {
        if (index < safetyObjectivesList.length) {
          setValue(
            `safetyObjectives.${index}.checked`,
            obj.objective === "true"
          );
          setValue(
            `safetyObjectives.${index}.promptType`,
            obj.objective_option || "verbal"
          );
        }
      });
    }

    // Set unusual occurrences
    if (transportationTypeAndObjectives.unusual_occurrences) {
      const unusual = transportationTypeAndObjectives.unusual_occurrences;
      setValue(
        "unusualOccurrence.occurred",
        unusual.hasUnusualOccurrence || false
      );

      const reasons: string[] = [];
      if (unusual.vehiclePulledOverDueToBehavior) reasons.push("behavior");
      if (unusual.vehiclePulledOverToAttendToNeeds) reasons.push("needs");
      if (unusual.trafficOnWay) reasons.push("traffic");
      if (unusual.other?.selected) reasons.push("other");

      setValue("unusualOccurrence.reasons", reasons);
      setValue(
        "unusualOccurrence.otherReason",
        unusual.other?.explanation || ""
      );
    }

    // Set traffic sign recognition
    if (transportationTypeAndObjectives.traffic_sign_recognition) {
      const traffic = transportationTypeAndObjectives.traffic_sign_recognition;

      // Map the traffic sign recognition to the form data
      setValue(
        "trafficSigns.0.checked",
        traffic.redLightIdentification.identified
      );
      setValue(
        "trafficSigns.0.promptType",
        traffic.redLightIdentification.option_picked || "verbal"
      );

      setValue(
        "trafficSigns.1.checked",
        traffic.yellowLightIdentification.identified
      );
      setValue(
        "trafficSigns.1.promptType",
        traffic.yellowLightIdentification.option_picked || "verbal"
      );

      setValue(
        "trafficSigns.2.checked",
        traffic.greenLightIdentification.identified
      );
      setValue(
        "trafficSigns.2.promptType",
        traffic.greenLightIdentification.option_picked || "verbal"
      );

      setValue(
        "trafficSigns.3.checked",
        traffic.pedestrianCrosswalk.identified
      );
      setValue(
        "trafficSigns.3.promptType",
        traffic.pedestrianCrosswalk.option_picked || "verbal"
      );

      setValue("trafficSigns.4.checked", traffic.pedestrianSignals.identified);
      setValue(
        "trafficSigns.4.promptType",
        traffic.pedestrianSignals.option_picked || "verbal"
      );
    }

    // Set directional concepts
    if (transportationTypeAndObjectives.directional_concepts) {
      const directional = transportationTypeAndObjectives.directional_concepts;

      setValue(
        "directionalConcepts.0.checked",
        directional.indicatedCorrectTurnsToMake.identified
      );
      setValue(
        "directionalConcepts.0.promptType",
        directional.indicatedCorrectTurnsToMake.option_picked || "verbal"
      );

      setValue(
        "directionalConcepts.1.checked",
        directional.landmarkIdentification.identified
      );
      setValue(
        "directionalConcepts.1.promptType",
        directional.landmarkIdentification.option_picked || "verbal"
      );

      setValue(
        "directionalConcepts.2.checked",
        directional.streetAddressIdentification.identified
      );
      setValue(
        "directionalConcepts.2.promptType",
        directional.streetAddressIdentification.option_picked || "verbal"
      );

      setValue(
        "directionalConcepts.3.checked",
        directional.destinationIdentification.identified
      );
      setValue(
        "directionalConcepts.3.promptType",
        directional.destinationIdentification.option_picked || "verbal"
      );

      setValue(
        "directionalConcepts.4.checked",
        directional.destinationAddressRecall.identified
      );
      setValue(
        "directionalConcepts.4.promptType",
        directional.destinationAddressRecall.option_picked || "verbal"
      );
    }
  }, [tiForm, setValue]);

  const onSubmit = async (data: TransportationFormData) => {
    try {
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        transportation_type_details: {
          whereWasDroppedOff: data.dropOffLocation || "",
          whoDroppedOff: data.whoDroppedOff || "",
          transportationStartTime: data.startTime || "",
          transportationEndTime: data.endTime || "",
          startLocation: data.startLocation || "",
          endingLocation: data.endingLocation || "",
          totalTransportationTime:
            timeDifference.hours || timeDifference.minutes
              ? `${timeDifference.hours} Hours : ${timeDifference.minutes} Minutes`
              : "",
        },
        // This needs to be individual objects in an array, not mapped with indexes
        transportation_safety_objectives: safetyObjectivesList.map(
          (item, index) => {
            const safetyObj = data.safetyObjectives[index];
            return {
              objective: safetyObj.checked ? "true" : "false", // Convert boolean to string to match the database schema
              objective_option: safetyObj.checked
                ? safetyObj.promptType || ""
                : "",
            };
          }
        ),
        unusual_occurrences: {
          hasUnusualOccurrence: data.unusualOccurrence.occurred,
          vehiclePulledOverDueToBehavior:
            data.unusualOccurrence.reasons.includes("behavior"),
          vehiclePulledOverToAttendToNeeds:
            data.unusualOccurrence.reasons.includes("needs"),
          trafficOnWay: data.unusualOccurrence.reasons.includes("traffic"),
          other: {
            selected: data.unusualOccurrence.reasons.includes("other"),
            explanation: data.unusualOccurrence.reasons.includes("other")
              ? data.unusualOccurrence.otherReason || ""
              : "",
          },
        },
        traffic_sign_recognition: {
          redLightIdentification: {
            identified: data.trafficSigns[0].checked,
            option_picked: data.trafficSigns[0].checked
              ? data.trafficSigns[0].promptType || ""
              : "",
          },
          yellowLightIdentification: {
            identified: data.trafficSigns[1].checked,
            option_picked: data.trafficSigns[1].checked
              ? data.trafficSigns[1].promptType || ""
              : "",
          },
          greenLightIdentification: {
            identified: data.trafficSigns[2].checked,
            option_picked: data.trafficSigns[2].checked
              ? data.trafficSigns[2].promptType || ""
              : "",
          },
          pedestrianCrosswalk: {
            identified: data.trafficSigns[3].checked,
            option_picked: data.trafficSigns[3].checked
              ? data.trafficSigns[3].promptType || ""
              : "",
          },
          pedestrianSignals: {
            identified: data.trafficSigns[4].checked,
            option_picked: data.trafficSigns[4].checked
              ? data.trafficSigns[4].promptType || ""
              : "",
          },
        },
        directional_concepts: {
          indicatedCorrectTurnsToMake: {
            identified: data.directionalConcepts[0].checked,
            option_picked: data.directionalConcepts[0].checked
              ? data.directionalConcepts[0].promptType || ""
              : "",
          },
          landmarkIdentification: {
            identified: data.directionalConcepts[1].checked,
            option_picked: data.directionalConcepts[1].checked
              ? data.directionalConcepts[1].promptType || ""
              : "",
          },
          streetAddressIdentification: {
            identified: data.directionalConcepts[2].checked,
            option_picked: data.directionalConcepts[2].checked
              ? data.directionalConcepts[2].promptType || ""
              : "",
          },
          destinationIdentification: {
            identified: data.directionalConcepts[3].checked,
            option_picked: data.directionalConcepts[3].checked
              ? data.directionalConcepts[3].promptType || ""
              : "",
          },
          destinationAddressRecall: {
            identified: data.directionalConcepts[4].checked,
            option_picked: data.directionalConcepts[4].checked
              ? data.directionalConcepts[4].promptType || ""
              : "",
          },
        },
      };

      const response = await submitTiVisitTransportationType(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.transportationTypeAndObjectives?.id
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
      console.error("ERROR SUBMITTING TRANSPORTATION TYPE", err);
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
        transportation_type_details: {
          whereWasDroppedOff: data.dropOffLocation || "",
          whoDroppedOff: data.whoDroppedOff || "",
          transportationStartTime: data.startTime || "",
          transportationEndTime: data.endTime || "",
          startLocation: data.startLocation || "",
          endingLocation: data.endingLocation || "",
          totalTransportationTime:
            timeDifference.hours || timeDifference.minutes
              ? `${timeDifference.hours} Hours : ${timeDifference.minutes} Minutes`
              : "",
        },
        // This needs to be individual objects in an array, not mapped with indexes
        transportation_safety_objectives: safetyObjectivesList.map(
          (item, index) => {
            const safetyObj = data.safetyObjectives[index];
            return {
              objective: safetyObj.checked ? "true" : "false", // Convert boolean to string to match the database schema
              objective_option: safetyObj.checked
                ? safetyObj.promptType || ""
                : "",
            };
          }
        ),
        unusual_occurrences: {
          hasUnusualOccurrence: data.unusualOccurrence.occurred,
          vehiclePulledOverDueToBehavior:
            data.unusualOccurrence.reasons.includes("behavior"),
          vehiclePulledOverToAttendToNeeds:
            data.unusualOccurrence.reasons.includes("needs"),
          trafficOnWay: data.unusualOccurrence.reasons.includes("traffic"),
          other: {
            selected: data.unusualOccurrence.reasons.includes("other"),
            explanation: data.unusualOccurrence.reasons.includes("other")
              ? data.unusualOccurrence.otherReason || ""
              : "",
          },
        },
        traffic_sign_recognition: {
          redLightIdentification: {
            identified: data.trafficSigns[0].checked,
            option_picked: data.trafficSigns[0].checked
              ? data.trafficSigns[0].promptType || ""
              : "",
          },
          yellowLightIdentification: {
            identified: data.trafficSigns[1].checked,
            option_picked: data.trafficSigns[1].checked
              ? data.trafficSigns[1].promptType || ""
              : "",
          },
          greenLightIdentification: {
            identified: data.trafficSigns[2].checked,
            option_picked: data.trafficSigns[2].checked
              ? data.trafficSigns[2].promptType || ""
              : "",
          },
          pedestrianCrosswalk: {
            identified: data.trafficSigns[3].checked,
            option_picked: data.trafficSigns[3].checked
              ? data.trafficSigns[3].promptType || ""
              : "",
          },
          pedestrianSignals: {
            identified: data.trafficSigns[4].checked,
            option_picked: data.trafficSigns[4].checked
              ? data.trafficSigns[4].promptType || ""
              : "",
          },
        },
        directional_concepts: {
          indicatedCorrectTurnsToMake: {
            identified: data.directionalConcepts[0].checked,
            option_picked: data.directionalConcepts[0].checked
              ? data.directionalConcepts[0].promptType || ""
              : "",
          },
          landmarkIdentification: {
            identified: data.directionalConcepts[1].checked,
            option_picked: data.directionalConcepts[1].checked
              ? data.directionalConcepts[1].promptType || ""
              : "",
          },
          streetAddressIdentification: {
            identified: data.directionalConcepts[2].checked,
            option_picked: data.directionalConcepts[2].checked
              ? data.directionalConcepts[2].promptType || ""
              : "",
          },
          destinationIdentification: {
            identified: data.directionalConcepts[3].checked,
            option_picked: data.directionalConcepts[3].checked
              ? data.directionalConcepts[3].promptType || ""
              : "",
          },
          destinationAddressRecall: {
            identified: data.directionalConcepts[4].checked,
            option_picked: data.directionalConcepts[4].checked
              ? data.directionalConcepts[4].promptType || ""
              : "",
          },
        },
      };

      const response = await submitTiVisitTransportationType(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.transportationTypeAndObjectives?.id
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
        Transportation Type & Objectives
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="border rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-6">Transportation Type</h4>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Controller
              name="dropOffLocation"
              control={control}
              render={({ field }) => (
                <FormSelect
                  labelText={`Where Was ${username} Dropped Off?`}
                  placeholder="Please select"
                  selectContent={[
                    { label: "Home", value: "Home" },
                    { label: "School", value: "School" },
                    { label: "Community", value: "Community" },
                  ]}
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isFormDisabled}
                  isError={!!errors.dropOffLocation}
                  errorMessage={errors.dropOffLocation?.message}
                />
              )}
            />

            <Controller
              name="whoDroppedOff"
              control={control}
              render={({ field }) => (
                <FormSelect
                  labelText={`Who Dropped ${username} Off?`}
                  placeholder="Please select"
                  selectContent={[
                    { label: "Parent", value: "Parent" },
                    { label: "Guardian", value: "Guardian" },
                    { label: "Teacher", value: "Teacher" },
                    { label: "Other", value: "Other" },
                  ]}
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isFormDisabled}
                  isError={!!errors.whoDroppedOff}
                  errorMessage={errors.whoDroppedOff?.message}
                />
              )}
            />

            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <FormSelect
                  labelText="Transportation Start Time"
                  placeholder="Please select"
                  selectContent={timeOptions}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (endTime && endTime <= value) {
                      setValue("endTime", "");
                    }
                  }}
                  value={field.value}
                  disabled={isFormDisabled}
                  isError={!!errors.startTime}
                  errorMessage={errors.startTime?.message}
                />
              )}
            />

            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <FormSelect
                  labelText="Transportation End Time"
                  placeholder="Please select"
                  selectContent={filterEndTimeOptions(startTime, timeOptions)}
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isFormDisabled || !startTime}
                  isError={!!errors.endTime}
                  errorMessage={errors.endTime?.message}
                />
              )}
            />

            <Controller
              name="startLocation"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <Label>Start Location</Label>
                  <Input
                    placeholder="Enter here"
                    {...field}
                    disabled={isFormDisabled}
                  />
                  {errors.startLocation && (
                    <span className="text-red-500 text-sm">
                      {errors.startLocation.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              name="endingLocation"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <Label>Ending Location</Label>
                  <Input
                    placeholder="Enter here"
                    {...field}
                    disabled={isFormDisabled}
                  />
                  {errors.endingLocation && (
                    <span className="text-red-500 text-sm">
                      {errors.endingLocation.message}
                    </span>
                  )}
                </div>
              )}
            />
          </div>

          <div className="mt-4 text-sm">
            Total Time Spent During Transportation - {timeDifference.hours}{" "}
            Hours : {timeDifference.minutes} Minutes
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-6">
            Transportation Objectives
          </h4>
          <div className="flex flex-col gap-6">
            <h5 className="text-base font-medium">
              Safety during transportation (Please select at least 4)
            </h5>

            <div className="flex flex-col gap-6">
              {safetyObjectivesList.map((objective, index) => (
                <div key={index} className="flex items-start gap-4">
                  <Controller
                    name={`safetyObjectives.${index}.checked`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id={`safety-${index}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isFormDisabled}
                        className="mt-1"
                      />
                    )}
                  />
                  <div className="flex flex-col xl:flex-row w-full gap-2 xl:gap-4 xl:items-center">
                    <Label
                      htmlFor={`safety-${index}`}
                      className="flex-grow text-base"
                    >
                      {username} {objective.label}
                    </Label>
                    <div className="min-w-[200px]">
                      <Controller
                        name={`safetyObjectives.${index}.promptType`}
                        control={control}
                        render={({ field }) => (
                          <FormSelect
                            placeholder="Verbal prompts"
                            selectContent={promptTypes}
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={
                              isFormDisabled ||
                              !watch(`safetyObjectives.${index}.checked`)
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.safetyObjectives && (
              <p className="text-red-500 text-sm mt-2">
                {errors.safetyObjectives.message}
              </p>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-6">
            Unusual occurrences during transportation
          </h4>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <p className="text-base">
                There was an unusual occurrence during transportation
              </p>
              <Controller
                name="unusualOccurrence.occurred"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    className="flex items-center gap-4"
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                    disabled={isFormDisabled}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="occurred_true" value="true" />
                      <Label htmlFor="occurred_true">True</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="occurred_false" value="false" />
                      <Label htmlFor="occurred_false">False</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {watch("unusualOccurrence.occurred") && (
              <div className="flex flex-col gap-4 pl-4">
                {unusualOccurrencesList.map((occurrence, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <Controller
                      name="unusualOccurrence.reasons"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id={`occurrence-${occurrence.value}`}
                            checked={field.value.includes(occurrence.value)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, occurrence.value]
                                : field.value.filter(
                                    (v) => v !== occurrence.value
                                  );
                              field.onChange(newValue);
                            }}
                            disabled={isFormDisabled}
                          />
                          <Label
                            htmlFor={`occurrence-${occurrence.value}`}
                            className="text-base"
                          >
                            {occurrence.label.replace(
                              "[client's name]",
                              username
                            )}
                          </Label>
                        </div>
                      )}
                    />

                    {occurrence.value === "other" &&
                      watch("unusualOccurrence.reasons").includes("other") && (
                        <Controller
                          name="unusualOccurrence.otherReason"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="Please explain"
                              className="flex-1"
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-6">
            Recognition of traffic signs during transportation
          </h4>

          <div className="flex flex-col gap-6">
            {trafficSignsList.map((sign, index) => (
              <div key={index} className="flex items-start gap-4">
                <Controller
                  name={`trafficSigns.${index}.checked`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={`traffic-${index}`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isFormDisabled}
                      className="mt-1"
                    />
                  )}
                />
                <div className="flex flex-col xl:flex-row w-full gap-2 xl:gap-4 xl:items-center">
                  <Label
                    htmlFor={`traffic-${index}`}
                    className="flex-grow text-base"
                  >
                    {username} {sign.label}
                  </Label>
                  <div className="min-w-[200px]">
                    <Controller
                      name={`trafficSigns.${index}.promptType`}
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          placeholder="Verbal prompts"
                          selectContent={promptTypes}
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={
                            isFormDisabled ||
                            !watch(`trafficSigns.${index}.checked`)
                          }
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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

export default TIVisitTransportationType;
