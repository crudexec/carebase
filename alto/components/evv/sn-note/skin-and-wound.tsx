import { zodResolver } from "@hookform/resolvers/zod";
import { SkinAndWound, User } from "@prisma/client";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PiWarningCircleFill } from "react-icons/pi";
import ImageMarker from "react-image-marker";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import {
  bedColor,
  bedTissueOptions,
  drainageAmount,
  drainageTypes,
  odor,
  surroundingTissueOptions,
  tissueThickness,
  woundEdge,
  woundTypes,
} from "@/constants";
import { useDisclosure, usePopulateForm, useSaveSkinAndWound } from "@/hooks";
import { cn } from "@/lib";
import {
  defaultWoundValue,
  ImageMarkerType,
  skinAndWoundDefaultValue,
  SkinAndWoundForm,
  skinAndWoundSchema,
} from "@/schema";

import { WoundLocationModal } from "../modal";

const SkinAndWoundComponent = ({
  caregiver,
  unscheduledVisitId,
  skilledNursingNoteId,
  patientId,
  data,
  snNoteType,
  callback,
  disabled,
}: {
  patientId: string;
  unscheduledVisitId?: string;
  skilledNursingNoteId?: string;
  snNoteType: string;
  callback: (skilledNursingNote?: string) => void;
  caregiver?: User;
  data: SkinAndWound;
  disabled?: boolean;
}) => {
  const methods = useForm<SkinAndWoundForm>({
    resolver: zodResolver(skinAndWoundSchema),
    defaultValues: skinAndWoundDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: response, trigger, isMutating } = useSaveSkinAndWound();
  const { opened, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (response?.success) {
      toast.success("Skin and wound detail saved successfully!");
      onClose();
      callback(response?.data?.skilledNursingNoteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "woundcare",
  });

  usePopulateForm<SkinAndWoundForm, SkinAndWound>(
    methods.reset,
    data as SkinAndWound,
  );

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            ...formData,
            id: data?.id as string,
            unscheduledVisitId,
            skilledNursingNoteId,
            caregiverId: caregiver?.id,
            snNoteType,
            patientId,
            woundcare: formData.woundcare,
          });
        })}
      >
        <div className="flex justify-end text-end mt-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes{" "}
          </Button>
        </div>
        <FormHeader className="mt-4">QA Status</FormHeader>
        <div className="flex flex-col gap-5 px-2">
          <FormField
            control={methods.control}
            name={"normalSkin"}
            render={({ field }) => (
              <FormRender>
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                  <span className="text-sm">Normal (Warm/Dry/Intact)</span>
                </div>
              </FormRender>
            )}
          />

          <div className="flex flex-wrap gap-x-48 gap-y-4 items-center">
            <div className="flex flex-row items-center gap-4">
              <p className="text-sm font-medium">Color</p>
              <FormField
                control={methods.control}
                name={"skinColor"}
                render={({ field }) => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <RadioInput
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "pink", label: "Pink" },
                        { value: "pale", label: "Pale" },
                        { value: "flushed", label: "Flushed" },
                      ]}
                      className="flex flex-row gap-2"
                      disabled={methods.watch("normalSkin") || disabled}
                    />
                  </FormRender>
                )}
              />
            </div>

            <div className="flex flex-row items-center gap-4">
              <p className="text-sm font-medium">Tugor</p>
              <FormField
                control={methods.control}
                name={"skinTugor"}
                render={({ field }) => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <RadioInput
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "good", label: "Good" },
                        { value: "fair", label: "Fair" },
                        { value: "poor", label: "Poor" },
                      ]}
                      className="flex flex-row gap-2"
                      disabled={methods.watch("normalSkin") || disabled}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="flex flex-row items-center gap-4">
              <p className="text-sm font-medium">Temperature</p>
              <FormField
                control={methods.control}
                name={"temperature"}
                render={({ field }) => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <RadioInput
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "warm", label: "Warm" },
                        { value: "cool", label: "Cool" },
                      ]}
                      className="flex flex-row gap-2"
                      disabled={methods.watch("normalSkin") || disabled}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="flex flex-row items-center gap-4">
              <p className="text-sm font-medium">Condition</p>
              <FormField
                control={methods.control}
                name={"skinCondition"}
                render={({ field }) => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <RadioInput
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "moist", label: "Moist" },
                        { value: "dry", label: "Dry" },
                      ]}
                      className="flex flex-row gap-2"
                      disabled={methods.watch("normalSkin") || disabled}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
          <FormField
            control={methods.control}
            name={"skinNote"}
            render={({ field }) => {
              return (
                <FormRender label="Skin note">
                  <Textarea
                    className="flex-row gap-5 items-center"
                    {...field}
                    value={field.value as string}
                    rows={6}
                    disabled={methods.watch("normalSkin") || disabled}
                  />
                </FormRender>
              );
            }}
          />
        </div>
        <FormHeader className="justify-between md:justify-center">
          Wound Care{" "}
          {methods.watch("woundcare")?.length === 0 && (
            <Button
              className="px-6 text-primary md:absolute right-2"
              variant={"outline"}
              type="button"
              onClick={() => append([defaultWoundValue])}
              disabled={disabled || isMutating}
            >
              + Add Wound{" "}
            </Button>
          )}
        </FormHeader>
        {fields.map((_, index) => (
          <div key={index}>
            <WoundLocationModal
              open={opened}
              modalClose={onClose}
              markers={methods
                ?.getValues("woundcare")
                [
                  index
                ].woundLocation.map((item) => ({ top: Number(item?.top), left: Number(item?.left) }))}
              callback={(marker) => {
                methods.setValue(
                  `woundcare.${index}.woundLocation`,
                  marker as ImageMarkerType[],
                );
              }}
              onClear={() =>
                methods.setValue(`woundcare.${index}.woundLocation`, [])
              }
              onSubmit={() =>
                trigger({
                  id: data?.id as string,
                  unscheduledVisitId,
                  skilledNursingNoteId,
                  snNoteType,
                  patientId,
                  woundcare: methods.getValues("woundcare"),
                  caregiverId: caregiver?.id,
                })
              }
              loading={isMutating}
            />
            <div className={cn("grid lg:grid-cols-5 gap-x-7 gap-y-4")}>
              <div className="flex flex-col justify-center items-center gap-5 lg:col-span-5">
                <ImageMarker
                  src="/images/wound-location.png"
                  markers={methods
                    ?.getValues("woundcare")
                    [
                      index
                    ].woundLocation.map((item) => ({ top: Number(item?.top), left: Number(item?.left) }))}
                  markerComponent={() => (
                    <div className="w-3 h-3 bg-[red] rounded-full" />
                  )}
                  extraClass="h-[100px] w-[100px]"
                />
                <Button type="button" onClick={onOpen} disabled={disabled}>
                  Location
                </Button>
              </div>
              <FormField
                control={methods.control}
                name={`woundcare.${index}.woundType`}
                render={({ field }) => (
                  <FormRender label={"Type of Wound"}>
                    <SelectInput
                      options={woundTypes}
                      field={field}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.location`}
                render={({ field }) => (
                  <FormRender label={"Location"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.tissueThickness`}
                render={({ field }) => (
                  <FormRender label={"Tissue Thickness"}>
                    <SelectInput
                      options={tissueThickness}
                      field={field}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.drainageType`}
                render={({ field }) => (
                  <FormRender label={"Drainage Type"}>
                    <SelectInput
                      options={drainageTypes}
                      field={field}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.drainageAmount`}
                render={({ field }) => (
                  <FormRender label={"Drainage Amount"}>
                    <SelectInput
                      options={drainageAmount}
                      field={field}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.undermining`}
                render={({ field }) => (
                  <FormRender label={"Undermining"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.bedColor`}
                render={({ field }) => (
                  <FormRender label={"Bed Color"}>
                    <SelectInput
                      options={bedColor}
                      field={field}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.tunnelling`}
                render={({ field }) => (
                  <FormRender label={"Tunnelling"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                      rightSection={
                        <p className="text-sm whitespace-nowrap">cm</p>
                      }
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.tunnellingLocation`}
                render={({ field }) => (
                  <FormRender label={"Tunnelling Location"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.odor`}
                render={({ field }) => (
                  <FormRender label={"Odor"}>
                    <SelectInput
                      options={odor}
                      field={field}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.edema`}
                render={({ field }) => (
                  <FormRender label="Edema">
                    <RadioInput
                      {...field}
                      value={field.value as string}
                      className="flex gap-4 flex-row"
                      options={[
                        { value: "none", label: "None" },
                        { value: "present", label: "Present" },
                      ]}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.woundEdge`}
                render={({ field }) => (
                  <FormRender label="Wound Edge">
                    <SelectInput
                      options={woundEdge}
                      field={field}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <div>
                <p className="text-sm font-medium pb-4">Symptoms</p>
                <FormField
                  control={methods.control}
                  name={`woundcare.${index}.bedTissue`}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={bedTissueOptions}
                        name={`woundcare.${index}.bedTissue`}
                        disabled={disabled}
                      />
                    </FormRender>
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-medium pb-4">Surrounding Tissue</p>
                <FormField
                  control={methods.control}
                  name={`woundcare.${index}.surroundingTissue`}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={surroundingTissueOptions}
                        name={`woundcare.${index}.surroundingTissue`}
                        disabled={disabled}
                      />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={`woundcare.${index}.notes`}
                render={({ field }) => {
                  return (
                    <FormRender label="Notes">
                      <Textarea
                        {...field}
                        value={field.value as string}
                        disabled={disabled}
                      />
                    </FormRender>
                  );
                }}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.NPWT`}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={disabled}
                      />
                      <span className="text-sm">NPWT</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
            <div className={cn("flex space-x-3 items-center my-4")}>
              {index === fields.length - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => append([defaultWoundValue])}
                  disabled={disabled}
                >
                  <PlusIcon className="size-4" />
                  Add More
                </Button>
              )}
              {fields.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  type="button"
                  onClick={() => remove(index)}
                  disabled={disabled}
                >
                  <MinusIcon className="size-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
        <FormHeader> Wound Information</FormHeader>
        <div className="flex flex-col md:flex-row md:items-end gap-5">
          <FormField
            control={methods.control}
            name={"signAndSymptoms"}
            render={({ field }) => (
              <FormRender>
                <RadioInput
                  {...field}
                  value={field.value as string}
                  className="flex gap-6 flex-col"
                  options={[
                    {
                      value: "no-signs",
                      label:
                        "No signs and symptoms of infection noted by nurse at this time",
                    },
                    {
                      value: "signs",
                      label: "Signs and symptoms of infection noted- Explain",
                    },
                  ]}
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"doctorNotified"}
            render={({ field }) => (
              <FormRender>
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={
                      methods.watch("signAndSymptoms") !== "signs" || disabled
                    }
                  />
                  <span className="text-sm">Doctor Notified</span>
                </div>
              </FormRender>
            )}
          />
        </div>
        <FormField
          control={methods.control}
          name={"symptomsExplanation"}
          render={({ field }) => {
            return (
              <FormRender formClassName="mt-4">
                <Textarea
                  className="flex-row gap-5 items-center"
                  {...field}
                  value={field.value as string}
                  rows={6}
                  disabled={
                    methods.watch("signAndSymptoms") !== "signs" || disabled
                  }
                />
              </FormRender>
            );
          }}
        />
        <div className="flex flex-col lg:flex-row mt-4 lg:items-end gap-5">
          <FormField
            control={methods.control}
            name={"teachingProvidedTo"}
            render={() => (
              <FormRender
                type="checkbox"
                label="Wound Care Teaching Provided to"
                formClassName="flex flex-wrap items-center gap-5 !space-y-0"
              >
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "family", label: "Family" },
                    { value: "patient", label: "Patient" },
                    { value: "other", label: "Other" },
                  ]}
                  name={"teachingProvidedTo"}
                  disabled={disabled}
                />
              </FormRender>
            )}
          />

          <FormField
            control={methods.control}
            name={"otherTeachingProvidedTo"}
            render={({ field }) => (
              <FormRender formClassName="flex-1">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={
                    !methods.watch("teachingProvidedTo")?.includes("other") ||
                    disabled
                  }
                />
              </FormRender>
            )}
          />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end gap-5 mt-4">
          <p className="text-sm font-medium">Wound Care Procedure</p>
          <FormField
            control={methods.control}
            name={"woundCareProcedure"}
            render={({ field }) => {
              return (
                <FormRender formClassName="flex-1">
                  <Textarea
                    className="flex-row gap-5 items-center"
                    {...field}
                    value={field.value as string}
                    rows={6}
                    disabled={disabled}
                  />
                </FormRender>
              );
            }}
          />
        </div>
        <div className="flex flex-col lg:flex-row mt-4 lg:items-end gap-5">
          <FormField
            control={methods.control}
            name={"responseToTeaching"}
            render={() => (
              <FormRender
                type="checkbox"
                label="Response to teaching"
                formClassName="flex flex-wrap items-center gap-5 !space-y-0"
              >
                <CheckboxGroup
                  methods={methods}
                  options={[
                    {
                      value: "returned-demonstration",
                      label: "Returned Demonstration Correctly",
                    },
                    {
                      value: "more-teaching-needed",
                      label: "More Teaching Needed",
                    },
                    { value: "other", label: "Other" },
                  ]}
                  name={"responseToTeaching"}
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherResponseToTeaching"}
            render={({ field }) => (
              <FormRender formClassName="flex-1">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={
                    !methods.watch("responseToTeaching")?.includes("other") ||
                    disabled
                  }
                />
              </FormRender>
            )}
          />
        </div>
        <div className="flex flex-col lg:flex-row mt-4 lg:items-end gap-5">
          <FormField
            control={methods.control}
            name={"responseToTeaching"}
            render={() => (
              <FormRender formClassName="flex flex-col gap-4 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    {
                      value: "tolerated-procedure-well",
                      label: "Patient Tolerated Procedure Well",
                    },
                    {
                      value: "with-difficulty",
                      label:
                        "Patient Tolerated Procedure with Difficulty - Explain",
                    },
                  ]}
                  name={"responseToTeaching"}
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"procedureDifficultyExplain"}
            render={({ field }) => (
              <FormRender formClassName="flex-1">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={
                    !methods
                      .watch("responseToTeaching")
                      ?.includes("with-difficulty") || disabled
                  }
                />
              </FormRender>
            )}
          />
        </div>
        <div className="bg-primary/20 flex text-sm py-5 px-4 items-center gap-3 mt-4">
          <PiWarningCircleFill />
          <p>
            No interventions have been indicated for this body system. To add
            interventions for this or any body system, please use the
            Intervention Summary section
          </p>
        </div>
        <div className="flex justify-end text-end my-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes{" "}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SkinAndWoundComponent;
