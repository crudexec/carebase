"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
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
import { genderOptions } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  parentHistorySchema,
  patientHistoryDefaultValue,
  PatientHistoryForm,
} from "@/schema/assessment/nursing";
import { ObjectData } from "@/types";

const PatientHistory = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: PatientHistoryForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<PatientHistoryForm>({
    resolver: zodResolver(parentHistorySchema),
    defaultValues: patientHistoryDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const {
    trigger: updateQAStatus,
    isMutating: updating,
    data: updateresponse,
  } = useUpdateQAStatus();
  const [action, setAction] = useState<QAStatus>();
  const [qaComment, setQaComment] = useState("");

  usePopulateForm(methods.reset, data);

  useEffect(() => {
    if (response?.success) {
      toast.success("Details saved successfully!");
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

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
              patientHistory: data,
            }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
            visitDate: data?.dateOfVisit,
            timeIn: data?.timeIn,
            timeOut: data?.timeOut,
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
                    setAction("APPROVED");
                  }}
                >
                  Approve
                </Button>{" "}
                <Button
                  className="px-6"
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setAction("REJECTED");
                  }}
                >
                  Disapprove
                </Button>{" "}
              </>
            )}
          </div>
          <div>
            <div className="grid md:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"dateOfVisit"}
                render={({ field }) => (
                  <FormRender label="Date of Visit">
                    <DateInput
                      {...field}
                      value={field.value as Date}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                  </FormRender>
                )}
              />
              <div />
              <FormField
                control={methods.control}
                name={"timeIn"}
                render={({ field }) => (
                  <FormRender label={"Time In:"}>
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
                name={"timeOut"}
                render={({ field }) => (
                  <FormRender label={"Time Out:"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      type="time"
                    />
                  </FormRender>
                )}
              />
            </div>
            <div>
              <p className="text-sm font-semibold py-5">Patient Name:</p>
              <div className="grid md:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"firstName"}
                  render={({ field }) => (
                    <FormRender label={"First:"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"gender"}
                  render={({ field }) => (
                    <FormRender label={"Gender:"}>
                      <SelectInput options={genderOptions} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"lastName"}
                  render={({ field }) => (
                    <FormRender label={"Last:"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"phoneNo"}
                  render={({ field }) => (
                    <FormRender label={"Phone No:"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"address"}
                  render={({ field }) => (
                    <FormRender label={"Address:"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"state"}
                  render={({ field }) => (
                    <FormRender label={"State:"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"zipCode"}
                  render={({ field }) => (
                    <FormRender label={"Zip Code:"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"dob"}
                  render={({ field }) => (
                    <FormRender label={"Date of Birth:"}>
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"socDate"}
                  render={({ field }) => (
                    <FormRender label={"S.O.C Date:"}>
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"healthInsuranceName"}
                  render={({ field }) => (
                    <FormRender label={"Health Insurance Name:"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
          </div>

          <div>
            <FormHeader className="mt-4">
              PERTINENT BACKGROUND INFORMATION
            </FormHeader>
            <div>
              <p className="text-sm font-semibold pb-5">Physician:</p>
              <div className="grid md:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"dateLastContacted"}
                  render={({ field }) => (
                    <FormRender label={"Date last contacted:"}>
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"dateLastVisited"}
                  render={({ field }) => (
                    <FormRender label={"Date last visited:"}>
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"presentIllness"}
                  render={({ field }) => (
                    <FormRender label="Present Illness" formClassName="mt-2">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"primaryReason"}
                  render={({ field }) => (
                    <FormRender
                      label="PRIMARY REASON FOR HOME CARE:"
                      formClassName="mt-2"
                    >
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"recentHospitalization"}
                  render={({ field }) => (
                    <FormRender label="Recent Hospitalization:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"recentHospitalizationDate"}
                  render={({ field }) => (
                    <FormRender label={"Date:"}>
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"recentHospitalizationReason"}
                  render={({ field }) => (
                    <FormRender label={"Reason:"} formClassName="md:col-span-2">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"newDiagnosis"}
                  render={({ field }) => (
                    <FormRender label="New diagnosis/condition:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"specify"}
                  render={({ field }) => (
                    <FormRender label={"Specify:"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold py-5">
                Patient History And/or Previous Outcomes:
              </p>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"patientHistory"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "hypertension", label: "Hypertension" },
                          { value: "cardiac", label: "Cardiac" },
                          { value: "diabetes", label: "Diabetes" },
                          { value: "respiratory", label: "Respiratory" },
                          { value: "osteoporosis", label: "Osteoporosis" },
                          { value: "fractures", label: "Fractures" },
                        ]}
                        name={"patientHistory"}
                      />
                    </FormRender>
                  )}
                />

                <div className="grid grid-col-1 md:grid-cols-4 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"cancerSites"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Cancer(site)</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"cancerComment"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"cancerInfection"}
                    render={() => (
                      <FormRender formClassName="md:col-span-2 flex-wrap flex flex-row items-start gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "infection", label: "Infection" },
                            {
                              value: "immunosuppressed",
                              label: "Immunosuppressed",
                            },
                            { value: "open-wound", label: "Open Wound" },
                          ]}
                          name={"cancerInfection"}
                        />
                      </FormRender>
                    )}
                  />
                </div>

                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"surgeries"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Surgeries</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"surgeriesComment"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"priorHospitalization"}
                    render={({ field }) => (
                      <FormRender label="Prior Hospitalization:">
                        <RadioInput
                          className="flex-row gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "YES", label: "Yes" },
                            { value: "NO", label: "No" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"noOfTimes"}
                    render={({ field }) => (
                      <FormRender label={"No. of times:"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"priorHospitalizationReason"}
                    render={({ field }) => (
                      <FormRender label={"Reason(s)"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"priorHospitalizationDate"}
                    render={({ field }) => (
                      <FormRender label={"Date(s):"}>
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="flex items-center gap-5">
                  <p className="text-sm font-semibold">Immunizations:</p>
                  <FormField
                    control={methods.control}
                    name={"immunizations"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Up-to-date</span>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                  <div className="md:col-span-2">
                    <FormField
                      control={methods.control}
                      name={"needs"}
                      render={() => (
                        <FormRender
                          label="Needs"
                          formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                        >
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "influenza", label: "Influenza" },
                              { value: "pneumonia", label: "Pneumonia" },
                              { value: "tetanus", label: "Tetanus" },
                              { value: "other", label: "Other" },
                            ]}
                            name={"needs"}
                          />
                        </FormRender>
                      )}
                    />
                  </div>

                  <FormField
                    control={methods.control}
                    name={"needsSpecify"}
                    render={({ field }) => (
                      <FormRender label={"Specify"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <FormHeader className="mt-4">
              LIVING ARRANGEMENTS/CAREGIVER INFORMATION
            </FormHeader>
            <div className="grid gap-5">
              <FormField
                control={methods.control}
                name={"livingArrangement"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "house", label: "House" },
                        { value: "apartment", label: "Apartment" },
                        { value: "new-environment", label: "New environment" },
                        { value: "family-present", label: "Family Present" },
                        { value: "lives-alone", label: "Lives alone" },
                        { value: "lives-others", label: "Lives w/others" },
                      ]}
                      name={"livingArrangement"}
                    />
                  </FormRender>
                )}
              />

              <div className="grid md:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"primaryCaregiver"}
                  render={({ field }) => (
                    <FormRender label={"Primary caregiver(name)"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"relationship"}
                  render={({ field }) => (
                    <FormRender label={"Relationship/Health status"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"livingArrangementADL"}
                render={() => (
                  <FormRender formClassName="flex flex-row items-start gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        {
                          value: "assists-with-adl",
                          label: "Assists with ADLs",
                        },
                        {
                          value: "physical-care",
                          label: "Provides physical care",
                        },
                      ]}
                      name={"livingArrangementADL"}
                    />
                  </FormRender>
                )}
              />

              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"livingArrangementOther"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Other(specify):</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"otherCaregiver"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Secondary/Other caregivers(describe):
                        </span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherCaregiverComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
          </div>

          <div>
            <FormHeader className="mt-4">EYES/EARS</FormHeader>
            <div className="grid gap-5">
              <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"eyesProblem"}
                  render={() => (
                    <FormRender formClassName="flex flex-row items-start gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "glasses", label: "Glasses" },
                          { value: "glaucoma", label: "Glaucoma" },
                          { value: "jaundice", label: "Jaundice" },
                        ]}
                        name={"eyesProblem"}
                      />
                    </FormRender>
                  )}
                />
                <div className="flex items-center">
                  <p className="text-sm font-semibold">Contact</p>({" "}
                  <FormField
                    control={methods.control}
                    name={"eyesContact"}
                    render={() => (
                      <FormRender formClassName="flex flex-row items-start gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "r", label: "R" },
                            { value: "l", label: "L" },
                          ]}
                          name={"eyesContact"}
                        />
                      </FormRender>
                    )}
                  />
                  )
                </div>
                <FormField
                  control={methods.control}
                  name={"eyeProblemVision"}
                  render={() => (
                    <FormRender formClassName="flex flex-row items-start gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "blurred-vision", label: "Blurred Vision" },
                          { value: "ptosis", label: "Ptosis" },
                        ]}
                        name={"eyeProblemVision"}
                      />
                    </FormRender>
                  )}
                />
              </div>
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"eyesInfection"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Infection</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"eyesInfectionComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"eyesCataract"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Cataract surgery:Site</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"eyesCataractComment"}
                  render={({ field }) => (
                    <FormRender label="Comment">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"eyesCataractDate"}
                  render={({ field }) => (
                    <FormRender label={"Date"}>
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </FormRender>
                  )}
                />
              </div>
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"otherEyesHistory"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Other (specify include history):
                        </span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherEyesHistoryComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"noEyeProblem"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">NO PROBLEM</span>
                    </div>
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-2 lg:grid-cols-4 items-center border border-dashed p-4 gap-5">
                <div className="flex items-center">
                  <p className="text-sm font-semibold">HOH</p>({" "}
                  <FormField
                    control={methods.control}
                    name={"hoh"}
                    render={() => (
                      <FormRender formClassName="flex flex-row items-start gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "r", label: "R" },
                            { value: "l", label: "L" },
                          ]}
                          name={"hoh"}
                        />
                      </FormRender>
                    )}
                  />
                  )
                </div>
                <div className="flex items-center">
                  <p className="text-sm font-semibold">Deaf</p>({" "}
                  <FormField
                    control={methods.control}
                    name={"deaf"}
                    render={() => (
                      <FormRender formClassName="flex flex-row items-start gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "r", label: "R" },
                            { value: "l", label: "L" },
                          ]}
                          name={"deaf"}
                        />
                      </FormRender>
                    )}
                  />
                  )
                </div>
                <div className="flex items-center">
                  <p className="text-sm font-semibold">Hearing Aid</p>({" "}
                  <FormField
                    control={methods.control}
                    name={"hearingAid"}
                    render={() => (
                      <FormRender formClassName="flex flex-row items-start gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "r", label: "R" },
                            { value: "l", label: "L" },
                          ]}
                          name={"hearingAid"}
                        />
                      </FormRender>
                    )}
                  />
                  )
                </div>
                <FormField
                  control={methods.control}
                  name={"earProblem"}
                  render={() => (
                    <FormRender formClassName="flex flex-row items-start gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "vertigo", label: "Vertigo" },
                          { value: "tinnitus", label: "Tinnitus" },
                        ]}
                        name={"earProblem"}
                      />
                    </FormRender>
                  )}
                />
              </div>

              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"otherEarsHistory"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Other (specify include history):
                        </span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherEarsHistoryComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"noEarProblem"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">NO PROBLEM</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>
          <div>
            <FormHeader className="mt-4">ALLERGIES</FormHeader>
            <div className="grid gap-5">
              <FormField
                control={methods.control}
                name={"allergies"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "none-known", label: "None known" },
                        { value: "aspirin", label: "Aspirin" },
                        { value: "penicillin", label: "Penicillin" },
                        { value: "sulfa", label: "Sulfa" },
                        { value: "pollen", label: "Pollen" },
                        { value: "eggs", label: "Eggs" },
                        { value: "milk-products", label: "Milk Products" },
                        { value: "insect-bite", label: "Insect Bite" },
                      ]}
                      name={"allergies"}
                    />
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"otherAllergies"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Other</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherAllergiesComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"noAllergiesProblem"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">NO PROBLEM</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>
          <div>
            <FormHeader className="mt-4">ADVANCE DIRECTIVES</FormHeader>
            <div className="grid gap-5">
              <FormField
                control={methods.control}
                name={"advanceDirectives"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "living-will", label: "Living will" },
                        {
                          value: "do-not-Resuscitate",
                          label: "Do not Resuscitate",
                        },
                        {
                          value: "education-needed",
                          label: "Education Needed",
                        },
                        { value: "copies-on-file", label: "Copies on file" },
                        {
                          value: "funeral-arrangements-made",
                          label: "Funeral arrangements made",
                        },
                      ]}
                      name={"advanceDirectives"}
                    />
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"advanceDirectivesOther"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Other</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"advanceDirectivesOtherComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"advanceDirectivesTeaching"}
                render={({ field }) => (
                  <FormRender
                    label="Teaching/Instructions:"
                    formClassName="mt-2"
                  >
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>
          <div>
            <FormHeader className="mt-4">PROGNOSIS</FormHeader>
            <FormField
              control={methods.control}
              name={"prognosis"}
              render={({ field }) => (
                <FormRender>
                  <RadioInput
                    className="flex-row gap-3 items-start"
                    {...field}
                    value={field.value as string}
                    options={[
                      { value: "POOR", label: "1-Poor" },
                      { value: "GUARDED", label: "2-Guarded" },
                      { value: "FAIR", label: "3-Fair" },
                      { value: "GOOD", label: "4-Good" },
                      { value: "EXCELLENT", label: "5-Excellent" },
                    ]}
                  />
                </FormRender>
              )}
            />
          </div>

          <div>
            <FormHeader className="mt-4">NOSE / THROAT / MOUTH</FormHeader>
            <div className="grid gap-5">
              <p className="text-sm font-semibold">NOSE:</p>
              <FormField
                control={methods.control}
                name={"noseProblem"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "congestion", label: "Congestion" },
                        { value: "epistaxis", label: "Epistaxis" },
                        { value: "loss-of-smell", label: "Loss of smell" },
                        { value: "sinus-prob", label: "Sinus prob" },
                      ]}
                      name={"noseProblem"}
                    />
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"otherNoseProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Other(specify,including history)
                        </span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherNoseProblemComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"noNoseProblem"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">NO PROBLEM</span>
                    </div>
                  </FormRender>
                )}
              />

              <p className="text-sm font-semibold">THROAT:</p>
              <FormField
                control={methods.control}
                name={"throatProblem"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "dysphagia", label: "Dysphagia" },
                        { value: "hoarseness", label: "Hoarseness" },
                        { value: "lesions", label: "Lesions" },
                        { value: "sore-throat", label: "Sore Throat" },
                      ]}
                      name={"throatProblem"}
                    />
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"otherThroatProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Other(specify,including history)
                        </span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherThroatProblemComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"noThroatProblem"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">NO PROBLEM</span>
                    </div>
                  </FormRender>
                )}
              />

              <p className="text-sm font-semibold">MOUTH:</p>

              <div className="grid md:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"mouthDentures"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Dentures</span>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"mouthProblemPart"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "upper", label: "Upper" },
                          { value: "lower", label: "Lower" },
                          { value: "partial", label: "Partial" },
                        ]}
                        name={"mouthProblemPart"}
                      />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"mouthProblem"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "masses", label: "Masses" },
                        { value: "tumors", label: "Tumors" },
                        { value: "gingivitis", label: "Gingivitis" },
                        { value: "ulcerations", label: "Ulcerations" },
                        { value: "toothache", label: "Toothache" },
                      ]}
                      name={"mouthProblem"}
                    />
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"otherMouthProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Other(specify,including history)
                        </span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherMouthProblemComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"noMouthProblem"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">NO PROBLEM</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>
          <div>
            <FormHeader className="mt-4">HEAD/NECK</FormHeader>
            <div className="grid gap-5">
              <FormField
                control={methods.control}
                name={"headNeckProblem"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "headache", label: "Headache" },
                        {
                          value: "neuro-Emotional",
                          label: "See Neuro/Emotional/Behavior status)",
                        },
                        { value: "injuries-Wounds", label: "injuries/Wounds" },
                        {
                          value: "skin-condition",
                          label: "See Skin Condition/Wound section)",
                        },
                      ]}
                      name={"headNeckProblem"}
                    />
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"otherHeadNeckMasses"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Masses/Nodes</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherHeadNeckProblemSite"}
                  render={({ field }) => (
                    <FormRender label="Site">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherHeadNeckProblemSize"}
                  render={({ field }) => (
                    <FormRender label="Size">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"alopecia"}
                render={({ field }) => (
                  <FormRender label="Alopecia">
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"otherHeadNeckProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Other(specify,including history)
                        </span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherHeadNeckProblemComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"noHeadNeckProblem"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">NO PROBLEM</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <FormHeader className="mt-4">
              ENDOCRINE/HEMATOLOGY(circle all that is applicable)
            </FormHeader>
            <div className="grid gap-5">
              <FormField
                control={methods.control}
                name={"diabetes"}
                render={({ field }) => (
                  <FormRender label="Diabetes:">
                    <RadioInput
                      className="flex-row gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "type-1", label: "Type I" },
                        { value: "type-2", label: "Type II" },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-2 items-center gap-5">
                <FormField
                  control={methods.control}
                  name={"dietControl"}
                  render={({ field }) => (
                    <FormRender label="Diet/Oral Control (specify):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"insulinDose"}
                  render={({ field }) => (
                    <FormRender label="Insulin dose/Frequency (specify):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"hyperglycemia"}
                render={() => (
                  <FormRender
                    label="Hyperglycemia:"
                    formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0"
                  >
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "glycosuria", label: "Glycosuria" },
                        { value: "polyuria", label: "Polyuria" },
                        { value: "polydipsia", label: "Polydipsia" },
                      ]}
                      name={"hyperglycemia"}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"hypoglycemia"}
                render={() => (
                  <FormRender
                    label="Hypoglycemia:"
                    formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0"
                  >
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "sweats", label: "Sweats" },
                        { value: "polyphagia", label: "Polyphagia" },
                        { value: "weak", label: "Weak" },
                        { value: "faint", label: "Faint" },
                        { value: "stupor", label: "Stupor" },
                      ]}
                      name={"hypoglycemia"}
                    />
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"bloodSugar"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Blood Sugar</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"bloodSugarRange"}
                  render={({ field }) => (
                    <FormRender label="Range">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"bloodSugarComment"}
                  render={({ field }) => (
                    <FormRender label="-">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>

              <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"patientReport"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Patient/Caregiver Report
                        </span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"bloodSugarPerformer"}
                  render={() => (
                    <FormRender
                      label="Who performs blood sugars"
                      formClassName="md:col-span-2 flex-wrap flex flex-row items-start gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "self", label: "Self" },
                          { value: "RN", label: "RN" },
                          {
                            value: "caregiver-report",
                            label: "Caregiver Report",
                          },
                        ]}
                        name={"bloodSugarPerformer"}
                      />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"enlargedThyriod"}
                render={() => (
                  <FormRender formClassName="flex flex-row flex-wrap items-start gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        {
                          value: "enlarged-thyroid ",
                          label: "Enlarged Thyroid ",
                        },
                        { value: "fatigue", label: "Fatigue" },
                        {
                          value: "intolerance-to-heat",
                          label: "Intolerance to heat/cold",
                        },
                      ]}
                      name={"enlargedThyriod"}
                    />
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"otherenlargedThyriodProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Other</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherenlargedThyriodProblemComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"anemia"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Anemia(Specify if known)
                        </span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"anemiaComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"secondaryBleed"}
                render={() => (
                  <FormRender
                    label="Secondary Bleed:"
                    formClassName="flex flex-wrap flex-row items-start gap-5 !space-y-0"
                  >
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "GI", label: "GI" },
                        { value: "GN", label: "GN" },
                        { value: "GYN", label: "GYN" },
                        { value: "unknown", label: "Unknown" },
                      ]}
                      name={"secondaryBleed"}
                    />
                  </FormRender>
                )}
              />
              <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                <FormField
                  control={methods.control}
                  name={"otherSecondaryBleed"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">other</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherSecondaryBleedComment"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"noEndocrineProblem"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">NO PROBLEM</span>
                    </div>
                  </FormRender>
                )}
              />
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
                  setAction("APPROVED");
                }}
              >
                Approve
              </Button>{" "}
              <Button
                className="px-6"
                variant="destructive"
                type="button"
                onClick={() => {
                  setAction("REJECTED");
                }}
              >
                Disapprove
              </Button>{" "}
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default PatientHistory;
