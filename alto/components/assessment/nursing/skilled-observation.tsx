import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageMarker from "react-image-marker";

import { WoundLocationModal } from "@/components/evv";
import FormHeader from "@/components/form-header";
import PromptModal from "@/components/prompt-modal";
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
import { useAuth } from "@/context/AuthContext";
import { useDisclosure, usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { cn, parseData } from "@/lib";
import {
  defaultWoundValue,
  ImageMarkerType,
  skinAndWoundDefaultValue,
  SkinAndWoundForm,
  skinAndWoundSchema,
} from "@/schema";
import { ObjectData } from "@/types";

const SkilledObservation = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data: SkinAndWoundForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm({
    resolver: zodResolver(skinAndWoundSchema),
    defaultValues: skinAndWoundDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { opened, onOpen, onClose } = useDisclosure();
  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "woundcare",
  });

  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const [action, setAction] = useState<QAStatus>();
  const [qaComment, setQaComment] = useState("");

  usePopulateForm<SkinAndWoundForm, SkinAndWoundForm>(methods.reset, data);

  useEffect(() => {
    if (response?.success) {
      toast.success("Details saved successfully!");
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);
  const {
    trigger: updateQAStatus,
    isMutating: updating,
    data: updateresponse,
  } = useUpdateQAStatus();

  useEffect(() => {
    if (updateresponse?.success) {
      toast.success(updateresponse?.message);
      mutate();
      setAction(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateresponse]);

  const updateStatus = async (status: QAStatus) => {
    await updateQAStatus({
      status,
      id: assessmentId as string,
      qaComment,
    });
  };

  return (
    <Form {...methods}>
      <PromptModal
        title={action === "APPROVED" ? "Approve" : "Disapprove"}
        variant={action === "APPROVED" ? "default" : "destructive"}
        open={!!action}
        onClose={() => setAction(undefined)}
        callback={async () => {
          updateStatus(action as QAStatus);
        }}
        loading={updating}
      >
        <div className="mb-5">
          <p className="mb-4  font-semibold">QA Comment</p>
          <Textarea
            value={qaComment}
            onChange={(e) => setQaComment(e.target.value)}
            placeholder="Add QA comments"
            rows={5}
          />
        </div>
      </PromptModal>

      <form
        onSubmit={methods.handleSubmit(async (data) => {
          trigger({
            nursingAssessment: parseData({
              ...assessment,
              skilledObservation: data,
            }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
          });
        })}
      >
        <div className="flex justify-end text-end mt-2 gap-2">
          {!isQA ? (
            <>
              <Button className="px-6" loading={isMutating}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                className="px-6"
                type="button"
                onClick={() => {
                  setAction("APPROVED");
                }}
              >
                Approve
              </Button>
              <Button
                className="px-6"
                variant="destructive"
                type="button"
                onClick={() => {
                  setAction("REJECTED");
                }}
              >
                Disapprove
              </Button>
            </>
          )}
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
                      disabled={methods.watch("normalSkin")}
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
                      disabled={methods.watch("normalSkin")}
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
                      disabled={methods.watch("normalSkin")}
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
                      disabled={methods.watch("normalSkin")}
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
                    disabled={methods.watch("normalSkin")}
                  />
                </FormRender>
              );
            }}
          />
        </div>
        <FormHeader className="justify-between md:justify-center">
          Wound Care
          {methods.watch("woundcare")?.length === 0 && (
            <Button
              className="px-6 text-primary md:absolute right-2"
              variant={"outline"}
              type="button"
              onClick={() => append([defaultWoundValue])}
            >
              + Add Wound
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
              onSubmit={() => null}
              loading={false}
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
                <Button type="button" onClick={onOpen}>
                  Location
                </Button>
              </div>
              <FormField
                control={methods.control}
                name={`woundcare.${index}.woundType`}
                render={({ field }) => (
                  <FormRender label={"Type of Wound"}>
                    <SelectInput options={woundTypes} field={field} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.location`}
                render={({ field }) => (
                  <FormRender label={"Location"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.tissueThickness`}
                render={({ field }) => (
                  <FormRender label={"Tissue Thickness"}>
                    <SelectInput options={tissueThickness} field={field} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.drainageType`}
                render={({ field }) => (
                  <FormRender label={"Drainage Type"}>
                    <SelectInput options={drainageTypes} field={field} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.drainageAmount`}
                render={({ field }) => (
                  <FormRender label={"Drainage Amount"}>
                    <SelectInput options={drainageAmount} field={field} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.undermining`}
                render={({ field }) => (
                  <FormRender label={"Undermining"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.bedColor`}
                render={({ field }) => (
                  <FormRender label={"Bed Color"}>
                    <SelectInput options={bedColor} field={field} />
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
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.odor`}
                render={({ field }) => (
                  <FormRender label={"Odor"}>
                    <SelectInput options={odor} field={field} />
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
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`woundcare.${index}.woundEdge`}
                render={({ field }) => (
                  <FormRender label="Wound Edge">
                    <SelectInput options={woundEdge} field={field} />
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
                      <Textarea {...field} value={field.value as string} />
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
                    disabled={methods.watch("signAndSymptoms") !== "signs"}
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
                  disabled={methods.watch("signAndSymptoms") !== "signs"}
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
                    !methods.watch("teachingProvidedTo")?.includes("other")
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
                    !methods.watch("responseToTeaching")?.includes("other")
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
                      ?.includes("with-difficulty")
                  }
                />
              </FormRender>
            )}
          />
        </div>

        <div className="flex justify-end text-end my-2 gap-2">
          {!isQA ? (
            <>
              <Button className="px-6" loading={isMutating}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                className="px-6"
                type="button"
                onClick={() => {
                  setAction("APPROVED");
                }}
              >
                Approve
              </Button>
              <Button
                className="px-6"
                variant="destructive"
                type="button"
                onClick={() => {
                  setAction("REJECTED");
                }}
              >
                Disapprove
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default SkilledObservation;
