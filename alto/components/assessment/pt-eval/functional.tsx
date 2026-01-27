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
  CheckboxGroup,
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
  functionalDefaultValue,
  FunctionalForm,
  functionalSchema,
} from "@/schema/assessment/pt-eval/functional";
import { ObjectData } from "@/types";

const Functional = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: FunctionalForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<FunctionalForm>({
    resolver: zodResolver(functionalSchema),
    defaultValues: functionalDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
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
            ptEval: parseData({ ...assessment, functional: data }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
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
            <div>
              <FormHeader className="mt-4">NEUROLOGICAL</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"neurological"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap md:col-span-2 items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "oriented", label: "Alert & Oriented x3" },
                          { value: "alert", label: "Alert" },
                          { value: "forgetful", label: "Forgetful" },
                          { value: "dizziness", label: "Dizziness" },
                          { value: "agitated", label: "Agitated" },
                          { value: "lethargic", label: "Lethargic" },
                          { value: "disoriented", label: "Disoriented" },
                          { value: "tremors", label: "Tremors" },
                        ]}
                        name={"neurological"}
                      />
                    </FormRender>
                  )}
                />
                <div>
                  <p className="text-sm font-semibold pb-2">Oriented:</p>
                  <FormField
                    control={methods.control}
                    name={"oriented"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap md:col-span-2 items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "time", label: "Time" },
                            { value: "place", label: "Place" },
                            { value: "person", label: "Person" },
                          ]}
                          name={"oriented"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"otherOriented"}
                  render={({ field }) => (
                    <FormRender label="Other">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"pupils"}
                  render={({ field }) => (
                    <FormRender label="Pupils:">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "right", label: "Right" },
                          { value: "left", label: "Left" },
                          { value: "both", label: "Both" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherGrasps"}
                  render={({ field }) => (
                    <FormRender label="Other">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"pupils"}
                  render={({ field }) => (
                    <FormRender label="Pupils:">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "equal", label: "Equal" },
                          { value: "reactive", label: "Reactive" },
                          { value: "PERRLA", label: "PERRLA" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherPupils"}
                  render={({ field }) => (
                    <FormRender label="Other">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                EAR / EYES / NOSE / THROAT
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"face"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap  items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "WNL", label: "WNL" },
                          {
                            value: "impaired-vision",
                            label: "Impaired Vision",
                          },
                          { value: "cataract", label: "Cataract/Glaucoma" },
                          {
                            value: "impaired-hearing",
                            label: "Impaired Hearing",
                          },
                          { value: "tinnitus", label: "Tinnitus" },
                          {
                            value: "impaired-speech",
                            label: "Impaired Speech",
                          },
                          { value: "epistaxis", label: "Epistaxis" },
                          { value: "congestion", label: "Congestion" },
                          { value: "blind", label: "Blind" },
                          { value: "deaf", label: "Deaf" },
                        ]}
                        name={"face"}
                      />
                    </FormRender>
                  )}
                />
                {methods.watch("face")?.includes("blind") && (
                  <FormField
                    control={methods.control}
                    name={"blindOther"}
                    render={({ field }) => (
                      <FormRender label={"Blind Other:"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                )}
                {methods.watch("face")?.includes("deaf") && (
                  <FormField
                    control={methods.control}
                    name={"deafOther"}
                    render={({ field }) => (
                      <FormRender label={"Deaf Other:"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                )}
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">HOME BOUND STATUS</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"homeboundStatus"}
                  render={({ field }) => (
                    <FormRender label="Choose an Oasis to populate homebound:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <p className="text-sm font-semibold">
                  Describe the patient's functional status that renders him/her
                  homebound. Must meet Criteria One A or B and Criteria Two A &
                  B.
                </p>
                <FormField
                  control={methods.control}
                  name={"criteriaOneA"}
                  render={({ field }) => (
                    <FormRender label="Criteria One: A. Requires the assistance of supportive device, use of special transportation, or the assistance of another person to leave home (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"criteriaOneB"}
                  render={({ field }) => (
                    <FormRender label="Or B. Leaving the home is medically contraindicated (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"criteriaTwoA"}
                  render={({ field }) => (
                    <FormRender label="AND Criteria Two: A. There exists a normal inability to leave home (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"criteriaTwoB"}
                  render={({ field }) => (
                    <FormRender label="AND B. Leaving home requires a considerable taxing effort (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"medicalCare"}
                  render={({ field }) => (
                    <FormRender label="AND Absences from the home are infrequent, or relatively short duration, or to receive medical care (describe):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherPrecautions"}
                  render={({ field }) => (
                    <FormRender label="Other Precautions:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"ptObtainedFrom"}
                  render={({ field }) => (
                    <FormRender label="PT/INR Obtained From:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"results"}
                  render={({ field }) => (
                    <FormRender label="Results:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">HOSPITAL RISK ASSESSMENT</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"hospitalRiskAssessment"}
                  render={({ field }) => (
                    <FormRender label="Hospital Risk Assessment">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"hospitalRiskAssessmentType"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "berg-balance",
                            label: "Berg Balance Scale",
                          },
                          { value: "timed-up", label: "Timed Up and Go" },
                          {
                            value: "tinetti-balance-test",
                            label: "Tinetti Balance Test",
                          },
                        ]}
                        name={"hospitalRiskAssessmentType"}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Discharge Planning</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"dischargePlanning"}
                  render={({ field }) => (
                    <FormRender label="Discharge Planning">
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

export default Functional;
