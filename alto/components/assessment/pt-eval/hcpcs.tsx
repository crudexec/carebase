"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import { CreatePhysicianModal } from "@/components/patient";
import PromptModal from "@/components/prompt-modal";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useGetPhysician, usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
// import { useSaveAssessment } from '@/hooks';
import { getFullName, parseData } from "@/lib";
import {
  hcpcsDefaultValue,
  HcpcsForm,
  hcpcsSchema,
} from "@/schema/assessment/pt-eval/hcpcs";
import { ObjectData } from "@/types";

const Hcpcs = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: HcpcsForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const [action, setAction] = React.useState<string>("");
  const { data: physician, mutate: refreshPhysician } = useGetPhysician();
  const methods = useForm<HcpcsForm>({
    resolver: zodResolver(hcpcsSchema),
    defaultValues: hcpcsDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const [status, setStatus] = useState<QAStatus>();
  const [qaComment, setQaComment] = useState("");

  usePopulateForm(methods.reset, data);

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
      setStatus(undefined);
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
    <div>
      <CreatePhysicianModal
        mode={"create"}
        title={"Create Physician"}
        open={action === "create-physician"}
        modalClose={() => {
          refreshPhysician();
          setAction("");
        }}
      />
      <PromptModal
        title={status === "APPROVED" ? "Approve" : "Disapprove"}
        variant={status === "APPROVED" ? "default" : "destructive"}
        open={!!status}
        onClose={() => setStatus(undefined)}
        callback={async () => {
          updateStatus(status as QAStatus);
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

      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(async (data) => {
            trigger({
              ptEval: parseData({ assessment, hcpcs: data }),
              patientScheduleId,
              caregiverId: authUser?.id as string,
              id: assessmentId,
              visitDate: data?.visitDate,
              timeIn: data?.arrivalTime,
              timeOut: data?.departureTime,
            });
          })}
        >
          <div className="p-5">
            <div className="flex justify-end text-end mt-2 gap-2">
              {!isQA ? (
                <>
                  <Button className="px-6" loading={isMutating}>
                    Save Changes
                  </Button>{" "}
                </>
              ) : (
                <>
                  <Button
                    className="px-6"
                    type="button"
                    onClick={() => {
                      setStatus("APPROVED");
                    }}
                  >
                    Approve
                  </Button>{" "}
                  <Button
                    className="px-6"
                    variant="destructive"
                    type="button"
                    onClick={() => {
                      setStatus("REJECTED");
                    }}
                  >
                    Disapprove
                  </Button>{" "}
                </>
              )}
            </div>
            <div>
              <div>
                <FormHeader className="mt-4">VISIT</FormHeader>
                <div className="grid gap-5">
                  <FormField
                    control={methods.control}
                    name={"serviceProvided"}
                    render={({ field }) => (
                      <FormRender label="Service Provided:">
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "pt-care", label: "PT Direct Care" },
                            {
                              value: "pt-maintenance",
                              label: "PT Maintenance",
                            },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"qCode"}
                    render={({ field }) => (
                      <FormRender label="Q Code:">
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            {
                              value: "patient-home",
                              label:
                                "Hospice or home health care provided in patients home/residence",
                            },
                            {
                              value: "assisted-living",
                              label:
                                "Hospice or home health care provided in assisted living facility",
                            },
                            {
                              value: "place-not-otherwise",
                              label:
                                "Hospice or home health care provided in place not otherwise specified (NO)",
                            },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"visitEvaluation"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "evaluation", label: "Evaluation" },
                            {
                              value: "post-hospital",
                              label: "Post Hospital Re- Evaluation",
                            },
                            {
                              value: "thirty-day",
                              label: "30th Day Re-Evaluation",
                            },
                            { value: "re-evaluation", label: "Re-Evaluation" },
                          ]}
                          name={"visitEvaluation"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"visitEvaluation"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "billable", label: "Billable" },
                            { value: "non-billable", label: "Non-Billable" },
                            { value: "missed-visit", label: "Missed Visit" },
                          ]}
                          name={"visitEvaluation"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid lg:grid-cols-2 gap-5">
                    <FormField
                      control={methods.control}
                      name={`visitDate`}
                      render={({ field }) => (
                        <FormRender label="Visit Date:" formClassName="flex-1">
                          <DateInput
                            {...field}
                            value={field.value as Date}
                            className="flex-1"
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"therapySIgnature"}
                      render={({ field }) => (
                        <FormRender label="Therapist Signature">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"arrivalTime"}
                      render={({ field }) => (
                        <FormRender label="Arrival Time:">
                          <Input
                            {...field}
                            value={field.value as string}
                            type="time"
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"departureTime"}
                      render={({ field }) => (
                        <FormRender label="Departure Time">
                          <Input
                            {...field}
                            value={field.value as string}
                            type="time"
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div>
                <FormHeader className="mt-4">MILAGE</FormHeader>
                <div className="grid gap-5">
                  <FormField
                    control={methods.control}
                    name={"milesTravelled"}
                    render={({ field }) => (
                      <FormRender label="Miles Travelled:">
                        <Input
                          {...field}
                          value={field.value as string}
                          placeholder="00.00"
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
              <div>
                <FormHeader className="mt-4">PATIENT INFORMATION</FormHeader>
                <div className="grid lg:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"patientName"}
                    render={({ field }) => (
                      <FormRender label="Patient:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"patientPhone"}
                    render={({ field }) => (
                      <FormRender label="Phone:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"patientAddress"}
                    render={({ field }) => (
                      <FormRender label="Address:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"patientPhysician"}
                    render={({ field }) => (
                      <FormRender label="Physician:">
                        <SelectInput
                          options={[
                            ...(physician?.data?.map((item) => ({
                              value: item.id as string,
                              label:
                                getFullName(item?.firstName, item?.lastName) ||
                                "Name not available",
                            })) ?? []),
                            {
                              value: "create-physician",
                              label: "+ Create new physician",
                            },
                          ]}
                          field={{
                            ...field,
                            onChange: (value) => {
                              if (value === "create-physician") {
                                setAction("create-physician");
                              } else {
                                field.onChange(value);
                              }
                            },
                          }}
                          placeholder="Select Physician"
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"patientCity"}
                    render={({ field }) => (
                      <FormRender label="City:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"physicianSign"}
                    render={({ field }) => (
                      <FormRender label="Physician Sign:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"patientState"}
                    render={({ field }) => (
                      <FormRender label="State:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"patientZip"}
                    render={({ field }) => (
                      <FormRender label="Zip:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"patientOnset"}
                    render={({ field }) => (
                      <FormRender label="Onset:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"patientDiagnosis"}
                    render={({ field }) => (
                      <FormRender label="Diagnosis:">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
              <div>
                <FormHeader className="mt-4">VITAL SIGNS</FormHeader>
                <div className="grid lg:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"vitalSignsResp"}
                    render={({ field }) => (
                      <FormRender label="Resp:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"bloodPressure"}
                    render={({ field }) => (
                      <FormRender label="Blood Pressure:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"apicalPulse"}
                    render={({ field }) => (
                      <FormRender label="Apical Pulse:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"lying"}
                    render={({ field }) => (
                      <FormRender label="Lying:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"radialPulse"}
                    render={({ field }) => (
                      <FormRender label="Radial Pulse:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"standing"}
                    render={({ field }) => (
                      <FormRender label="Standing:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"weight"}
                    render={({ field }) => (
                      <FormRender label="Weight:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"sitting"}
                    render={({ field }) => (
                      <FormRender label="Sitting:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"temperature"}
                    render={({ field }) => (
                      <FormRender label="Temp:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
              <div>
                <FormHeader className="mt-4">REHAB POTENTIAL</FormHeader>
                <div className="grid gap-5">
                  <FormField
                    control={methods.control}
                    name={"rehabPotential"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "excellent", label: "Excellent" },
                            { value: "good", label: "Good" },
                            { value: "fair", label: "Fair" },
                            { value: "poor", label: "Poor" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
              <div>
                <FormHeader className="mt-4">MENTAL STATUS</FormHeader>
                <div className="grid gap-5">
                  <FormField
                    control={methods.control}
                    name={"mentalStatus"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "oriented", label: "Oriented" },
                            { value: "forgetful", label: "Forgetful" },
                            { value: "disoriented", label: "Disoriented" },
                            { value: "agitated", label: "Agitated" },
                            { value: "lethargic", label: "Lethargic" },
                            { value: "comatose", label: "Comatose" },
                            { value: "other", label: "Other" },
                          ]}
                          name={"mentalStatus"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
              <div>
                <FormHeader className="mt-4">PAIN ASSESSMENT</FormHeader>
                <div className="grid lg:grid-cols-2 gap-5">
                  <div className="grid gap-5">
                    <p className="text-sm font-semibold">Site 01:</p>
                    <FormField
                      control={methods.control}
                      name={"siteOneLocation"}
                      render={({ field }) => (
                        <FormRender label="Location:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"siteOneIntensity"}
                      render={({ field }) => (
                        <FormRender label="Intensity:">
                          <SelectInput
                            options={[
                              { label: "0", value: "0" },
                              { label: "1", value: "1" },
                              { label: "2", value: "2" },
                              { label: "3", value: "3" },
                              { label: "4", value: "4" },
                              { label: "5", value: "5" },
                              { label: "6", value: "6" },
                              { label: "7", value: "7" },
                              { label: "8", value: "8" },
                              { label: "9", value: "9" },
                              { label: "10", value: "10" },
                            ]}
                            field={field}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"siteOneDuration"}
                      render={({ field }) => (
                        <FormRender label="Duration:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"siteOneMedication"}
                      render={({ field }) => (
                        <FormRender label="Medication:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"siteOneRelievingFactors"}
                      render={({ field }) => (
                        <FormRender label="Relieving Factors:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid gap-5">
                    <p className="text-sm font-semibold">Site 02:</p>
                    <FormField
                      control={methods.control}
                      name={"siteTwoLocation"}
                      render={({ field }) => (
                        <FormRender label="Location:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"siteTwoIntensity"}
                      render={({ field }) => (
                        <FormRender label="Intensity:">
                          <SelectInput
                            options={[
                              { label: "0", value: "0" },
                              { label: "1", value: "1" },
                              { label: "2", value: "2" },
                              { label: "3", value: "3" },
                              { label: "4", value: "4" },
                              { label: "5", value: "5" },
                              { label: "6", value: "6" },
                              { label: "7", value: "7" },
                              { label: "8", value: "8" },
                              { label: "9", value: "9" },
                              { label: "10", value: "10" },
                            ]}
                            field={field}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"siteTwoDuration"}
                      render={({ field }) => (
                        <FormRender label="Duration:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"siteTwoMedication"}
                      render={({ field }) => (
                        <FormRender label="Medication:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"siteTwoRelievingFactors"}
                      render={({ field }) => (
                        <FormRender label="Relieving Factors:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div>
                <FormHeader className="mt-4">FUNCTIONAL IMPAIRMENTS</FormHeader>
                <div className="grid gap-5">
                  <FormField
                    control={methods.control}
                    name={"muscleTone"}
                    render={({ field }) => (
                      <FormRender label="Muscle Tone:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"fuctionalImpairments"}
                    render={({ field }) => (
                      <FormRender label="Functional Impairments:">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isDysneaOnExertion"}
                    render={({ field }) => (
                      <FormRender formClassName="mt-4">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Dyspnea on Exertion</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"qaComments"}
                    render={({ field }) => (
                      <FormRender label="QA Comments:">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end text-end mt-2 pb-12 pr-5 gap-2">
            {!isQA ? (
              <>
                <Button className="px-6" loading={isMutating}>
                  Save Changes
                </Button>{" "}
              </>
            ) : (
              <>
                <Button
                  className="px-6"
                  type="button"
                  onClick={() => {
                    setStatus("APPROVED");
                  }}
                >
                  Approve
                </Button>{" "}
                <Button
                  className="px-6"
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setStatus("REJECTED");
                  }}
                >
                  Disapprove
                </Button>{" "}
              </>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Hcpcs;
