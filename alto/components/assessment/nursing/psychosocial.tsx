"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import AppLoader from "@/components/app-loader";
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
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  psychosocialDefaultValue,
  PyschosocialForm,
  pyschosocialSchema,
} from "@/schema/assessment/nursing";
import { ObjectData } from "@/types";

const PsychoSocial = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: PyschosocialForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<PyschosocialForm>({
    resolver: zodResolver(pyschosocialSchema),
    defaultValues: psychosocialDefaultValue,
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

      <AppLoader loading={false} />
      <form
        onSubmit={methods.handleSubmit(async (data) => {
          trigger({
            nursingAssessment: parseData({ ...assessment, psychosocial: data }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
          });
        })}
      >
        <div className="p-5">
          <div>
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

            <div>
              <FormHeader className="mt-4">GENITOURINAY</FormHeader>
              <p className="text-sm pb-5 font-semibold">
                Circle all that applicable
              </p>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"genitouarinay"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "urgency", label: "Urgency/frequency" },
                          { value: "burning", label: "Burning/pain" },
                          { value: "hesitancy", label: "Hesitancy" },
                          { value: "nocturia", label: "Nocturia" },
                          { value: "hematuria", label: "Hematuria" },
                          { value: "oliguria", label: "Oliguria/anuria" },
                        ]}
                        name={"genitouarinay"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isIncontinence"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Incontinence(details if applicable)
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"incontinenceDetails"}
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
                    name={"diapers"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Diapers/Other:</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"diapersDetail"}
                    render={({ field }) => (
                      <FormRender>
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                  <div className="md:col-span-2">
                    <FormField
                      control={methods.control}
                      name={"color"}
                      render={({ field }) => (
                        <FormRender label="Color:">
                          <RadioInput
                            className="flex-row gap-3 items-start"
                            {...field}
                            options={[
                              { value: "yellow", label: "Yellow/straw" },
                              { value: "amber", label: "Amber" },
                              { value: "brown", label: "Brown/gray" },
                              { value: "blood-tinged", label: "Blood-tinged" },
                              { value: "other", label: "Other" },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"otherColor"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"clarity"}
                    render={({ field }) => (
                      <FormRender label="Color:">
                        <RadioInput
                          className="flex-row gap-3 items-start"
                          {...field}
                          options={[
                            { value: "clear", label: "Clear" },
                            { value: "cloudy", label: "Cloudy" },
                            { value: "sediment", label: "Sediment/mucous" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"odor"}
                    render={({ field }) => (
                      <FormRender label="Odor:">
                        <RadioInput
                          className="flex-row gap-3 items-start"
                          {...field}
                          options={[
                            { value: "yes", label: "Yes" },
                            { value: "no", label: "No" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"urinaryCatherther"}
                    render={({ field }) => (
                      <FormRender label="Urinary Catheter: Type(specify)">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"dateLastChange"}
                    render={({ field }) => (
                      <FormRender label="Date last change:">
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
                    name={"foleyInserted"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Foley inserted(date)</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"foleyInsertedDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
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
                    name={"foleyInsertedWith"}
                    render={({ field }) => (
                      <FormRender label="With">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"foleyInsertedBalloonWith"}
                    render={({ field }) => (
                      <FormRender label="French Inflated balloon with:">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                          <p className="text-sm">ml</p>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"withoutDifficulty"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">without difficulty</span>
                      </div>
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-2 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"irrigationSolution"}
                    render={({ field }) => (
                      <FormRender label="Irrigation solution: Type(specify)">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"irrigationSolutionAmount"}
                    render={({ field }) => (
                      <FormRender label="Amount">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                          <p className="text-sm">ml</p>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"irrigationSolutionFrequency"}
                    render={({ field }) => (
                      <FormRender label="Frequency">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"irrigationSolutionReturns"}
                    render={({ field }) => (
                      <FormRender label="Returns">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"patientTolerated"}
                  render={({ field }) => (
                    <FormRender label="Patient tolerated procedure well:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isOtherGenitourinary"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other(specify)</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherGenitourinary"}
                    render={({ field }) => (
                      <FormRender>
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"isNoGenitourinaryProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">No Problem</span>
                      </div>
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">ABDOMEN</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"genitouarinay"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "tenderness", label: "Tenderness" },
                          { value: "pain", label: "Pain" },
                          { value: "distention", label: "Distention" },
                          { value: "hard", label: "Hard" },
                          { value: "soft", label: "Soft" },
                          { value: "ascites", label: "Ascites" },
                        ]}
                        name={"genitouarinay"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"abdominalGirth"}
                    render={({ field }) => (
                      <FormRender label="Abdominal girth:">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                          <p className="text-sm">inches</p>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"enteralTube"}
                    render={({ field }) => (
                      <FormRender label="NG/enteral tube(type/size)">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                  <div className="md:col-span-2">
                    <FormField
                      control={methods.control}
                      name={"bowelSounds"}
                      render={({ field }) => (
                        <FormRender label="Bowel sounds:">
                          <RadioInput
                            className="flex-row gap-3 items-start"
                            {...field}
                            options={[
                              { value: "active", label: "Active" },
                              { value: "absent", label: "Absent" },
                              { value: "hypo", label: "Hypo" },
                              { value: "hyperactive", label: "Hyperactive" },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"xQuadrants"}
                    render={({ field }) => (
                      <FormRender label="X:">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                          <p className="text-sm">quadrants</p>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isOtherAbdomen"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other(specify)</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherAbdomen"}
                    render={({ field }) => (
                      <FormRender>
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"isNoAbdomenProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">No Problem</span>
                      </div>
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">GENITALIA</FormHeader>
              <div className="grid gap-5">
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isDischargeDrainage"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Discharge/Drainage:(describe)
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"dischargeDrainage"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"genitalia"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "lesions-blisters",
                            label: "Lesions Blisters/Masses/Cyst",
                          },
                          { value: "inflammation", label: "Inflammation" },
                          {
                            value: "surgical-alteration",
                            label: "Surgical alteration",
                          },
                        ]}
                        name={"genitalia"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"postrateProblem"}
                    render={() => (
                      <FormRender
                        label="Postrate Problem"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "BPH", label: "BPH" },
                            { value: "TURP", label: "TURP" },
                          ]}
                          name={"postrateProblem"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"postrateProblemDate"}
                    render={({ field }) => (
                      <FormRender label="Date:">
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
                    name={"isTesticularExam"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Self-testicular exam</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"testicularExamFrequency"}
                    render={({ field }) => (
                      <FormRender label="Frequency">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isMenopause"}
                    render={() => (
                      <FormRender
                        label="Postrate Problem"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "menopause", label: "Menopause" },
                            { value: "hysterectomy", label: "Hysterectomy" },
                          ]}
                          name={"isMenopause"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"menopauseDate"}
                    render={({ field }) => (
                      <FormRender label="Date:">
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
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"dateLastPAP"}
                    render={({ field }) => (
                      <FormRender label="Date last PAP">
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
                    name={"lastPAPResult"}
                    render={({ field }) => (
                      <FormRender label="Results">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isBreastExam"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Breast self-exam</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"breastExamFrequency"}
                    render={({ field }) => (
                      <FormRender label="Frequency">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <div>
                    <p className="text-sm font-semibold pb-2">Discharge</p>
                    <FormField
                      control={methods.control}
                      name={"breastExamDischarge"}
                      render={() => (
                        <FormRender formClassName="flex  items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "R", label: "R" },
                              { value: "L", label: "L" },
                            ]}
                            name={"breastExamDischarge"}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"mastectomy"}
                    render={() => (
                      <FormRender
                        label="Mastectomy"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "R", label: "R" },
                            { value: "L", label: "L" },
                          ]}
                          name={"mastectomy"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"mastectomyDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
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
                    name={"isOtherGenitalia"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other(specify)</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherGenitalia"}
                    render={({ field }) => (
                      <FormRender>
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"isNoGenitaliaProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">No Problem</span>
                      </div>
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">MUSCULOSKELETAL</FormHeader>
              <div className="grid gap-5">
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"musculoskeletal"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "shuffling",
                              label: "Shuffling/Wide-based gait",
                            },
                            { value: "weakness", label: "Weakness" },
                          ]}
                          name={"musculoskeletal"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"musculoskeletalDetails"}
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
                    name={"musculoskeletal"}
                    render={() => (
                      <FormRender
                        label="Amputation:"
                        formClassName="md:col-span-2 flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "BK", label: "BK" },
                            { value: "AK", label: "AK" },
                            { value: "UE", label: "UE" },
                            { value: "RL", label: "RL(specify)" },
                          ]}
                          name={"musculoskeletal"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"amputationDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"isHemiplegia"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "hemiplegia", label: "Hemiplegia" },
                          { value: "paraplegia", label: "Paraplegia" },
                          { value: "quadriplegia", label: "Quadriplegia" },
                        ]}
                        name={"isHemiplegia"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherMusculoskeletal"}
                  render={({ field }) => (
                    <FormRender label="Other">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"isNoMusculoskeletalProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">No Problem</span>
                      </div>
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isFractureLocation"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Fracture(location)</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"fractureLocationDetails"}
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
                    name={"isSwollenPainfulJoints"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Swollen,painful joints(specify)
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"swollenPainfulJointsDetails"}
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
                    name={"isContractures"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Contractures</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"contracturesJoint"}
                    render={({ field }) => (
                      <FormRender label="Joint">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"contracturesLocation"}
                    render={({ field }) => (
                      <FormRender label="Location">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isAtrophy"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Atrophy</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"atrophyDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isPoorConditioning"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Poor conditioning</span>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isDecreasedROM"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Decreased ROM</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"decreasedROMDetails"}
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
                    name={"isParesthesia"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Paresthesia</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"paresthesiaDetails"}
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
              <FormHeader className="mt-4">
                NEURO/EMOTIONAL/BEHAVIOR STATUS
              </FormHeader>
              <div className="grid gap-5">
                <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isHeadache"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Headache</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"headacheLocation"}
                    render={({ field }) => (
                      <FormRender label="Location">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"headacheFrequency"}
                    render={({ field }) => (
                      <FormRender label="Frequency">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isPerrla"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">PERRLA</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"isUnequalPupils"}
                    render={() => (
                      <FormRender
                        label="Unequal pupuls:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "right", label: "Right" },
                            { value: "left", label: "Left" },
                          ]}
                          name={"isUnequalPupils"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"aphasia"}
                    render={() => (
                      <FormRender
                        label="Aphasia:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "receptive", label: "Receptive" },
                            { value: "expressive", label: "Expressive" },
                          ]}
                          name={"aphasia"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isMotorChange"}
                    render={() => (
                      <FormRender
                        label="Motor Change:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "fine", label: "Fine" },
                            { value: "gross", label: "Gross" },
                          ]}
                          name={"aphasia"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"motorChangeSite"}
                    render={({ field }) => (
                      <FormRender label="Site">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isDominantSide"}
                    render={() => (
                      <FormRender
                        label="Dominant side:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "right", label: "Right" },
                            { value: "left", label: "Left" },
                          ]}
                          name={"aphasia"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"dominantSideDetails"}
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
                    name={"weakness"}
                    render={() => (
                      <FormRender
                        label="Weakness"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "UE", label: "UE" },
                            { value: "LE", label: "LE" },
                          ]}
                          name={"weakness"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"weaknessLocation"}
                    render={({ field }) => (
                      <FormRender label="Location">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"tremors"}
                    render={() => (
                      <FormRender
                        label="Tremors"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "fine", label: "Fine" },
                            { value: "gross", label: "Gross" },
                            { value: "paralysis", label: "Paralysis" },
                          ]}
                          name={"tremors"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"isTremorsLocation"}
                    render={({ field }) => (
                      <FormRender label="Site">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"stuporous"}
                  render={() => (
                    <FormRender
                      label="Stuporous/Hallucinations:"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "visual", label: "Visual" },
                          { value: "auditoty", label: "Auditoty" },
                        ]}
                        name={"stuporous"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"handGrips"}
                    render={() => (
                      <FormRender
                        label="Hand grips"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "equal", label: "Equal" },
                            { value: "unequal", label: "Unequal" },
                          ]}
                          name={"handGrips"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"handGripsDetails"}
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
                    name={"handGripsStrength"}
                    render={() => (
                      <FormRender
                        label="Hand grips"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "strong", label: "Strong" },
                            { value: "weak", label: "Weak" },
                          ]}
                          name={"handGripsStrength"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"handGripsStrengthDetails"}
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
                    name={"isPsychotropicDrugUse"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Psychotropic drug use(specify):
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"psychotropicDrugUseDose"}
                    render={({ field }) => (
                      <FormRender label="Dose/Frequency">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"otherNeuroEmotionalBehavior"}
                  render={({ field }) => (
                    <FormRender label="Other">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"isNoNeuroEmotionalBehaviorProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">No Problem</span>
                      </div>
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
                          { value: "comatose", label: "Comatose" },
                          { value: "forgetful", label: "Forgetful" },
                          { value: "depressed", label: "Depressed" },
                          { value: "disoriented", label: "Disoriented" },
                          { value: "lethargic", label: "Lethargic" },
                          { value: "agitated", label: "Agitated" },
                        ]}
                        name={"mentalStatus"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherMentalStatus"}
                  render={({ field }) => (
                    <FormRender label="Other">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"isNoMentalStatusProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">No Problem</span>
                      </div>
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">PSYCHOLOGICAL</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"primaryLanguage"}
                  render={({ field }) => (
                    <FormRender label="Primary Language:">
                      <Input
                        {...field}
                        value={field.value as string}
                        placeholder="English"
                      />
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isLanguageBarrier"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Language barrier:</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isNeedInterpreter"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Needs interpreter:</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"interpreterDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"leaningBarrier"}
                  render={() => (
                    <FormRender
                      label="Leaning barrier:"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "mental", label: "Mental" },
                          { value: "psychosocial", label: "Psychosocial" },
                          { value: "physical", label: "Physical" },
                          { value: "functional", label: "Functional" },
                        ]}
                        name={"leaningBarrier"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isUnableToWrite"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Unable to read/write</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"educationLevel"}
                    render={({ field }) => (
                      <FormRender label="Educational level:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"psychologicalMood"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "angry", label: "Angry" },
                          {
                            value: "difficult-coping ",
                            label: "Difficult coping ",
                          },
                          { value: "withdrawn", label: "Withdrawn" },
                          { value: "discouraged", label: "Discouraged" },
                          { value: "flat-affect", label: "Flat affect" },
                          { value: "disorganized", label: "Disorganized" },
                        ]}
                        name={"psychologicalMood"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"isSpiritualCulturalImplications"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Spiritual/Cultural implications that impact care.
                        </span>
                      </div>
                    </FormRender>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"spiritualResource"}
                    render={({ field }) => (
                      <FormRender label="Spiritual resource:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"phoneNo"}
                    render={({ field }) => (
                      <FormRender label="Phone No:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"depressed"}
                    render={() => (
                      <FormRender
                        label="Depressed:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "recent", label: "Recent" },
                            { value: "long-term", label: "Long term" },
                          ]}
                          name={"depressed"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"treatment"}
                    render={({ field }) => (
                      <FormRender label="Treatment:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"dueTo"}
                  render={() => (
                    <FormRender
                      label="Due to:"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "lack-of-motivation",
                            label: "Lack of motivation",
                          },
                          {
                            value: "inability-to-recognize-problems",
                            label: "Inability to recognize problems",
                          },
                          {
                            value: "unrealistic-expectations",
                            label: "Unrealistic expectations",
                          },
                          {
                            value: "denial-of-problems",
                            label: "Denial of problems",
                          },
                        ]}
                        name={"dueTo"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"sleep"}
                    render={() => (
                      <FormRender
                        label="Sleeps/Rest:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "adequate", label: "Adequate" },
                            { value: "inadequate", label: "Inadequate" },
                          ]}
                          name={"sleep"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"sleepDetails"}
                    render={({ field }) => (
                      <FormRender label="Explain:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"substanceAbuse"}
                  render={() => (
                    <FormRender
                      label="Substance abuse:"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "drugs", label: "Drugs" },
                          { value: "alcohol", label: "Alcohol" },
                          { value: "tobacco", label: "Tobacco" },
                        ]}
                        name={"dueTo"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"abuseEvidence"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "inappropriate responses-to-caregivers",
                            label:
                              "Inappropriate responses to caregivers/clinician",
                          },
                          {
                            value: "evidence-of-abuse",
                            label: "Evidence of abuse",
                          },
                          { value: "potential", label: "Potential" },
                          { value: "actual", label: "Actual" },
                          { value: "verbal", label: "Verbal/Emotional" },
                          { value: "physical", label: "Physical" },
                          { value: "financial", label: "Financial" },
                        ]}
                        name={"abuseEvidence"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"describeObjective"}
                    render={({ field }) => (
                      <FormRender label="Describe objective/subjective finding">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherPsychological"}
                    render={({ field }) => (
                      <FormRender label="Other">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"isNoPsychologicalProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">No Problem</span>
                      </div>
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

export default PsychoSocial;
