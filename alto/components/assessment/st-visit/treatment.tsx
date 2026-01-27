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
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  treatmentDefaultValue,
  TreatmentForm,
  treatmentSchema,
} from "@/schema/assessment/st-visit/treatment";
import { ObjectData } from "@/types";

const Treatment = ({
  assessmentId,
  patientScheduleId,
  mutate,
  assessment,
  data,
  isQA,
}: {
  assessmentId?: string;
  data?: TreatmentForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<TreatmentForm>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: treatmentDefaultValue,
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
            stVisit: parseData({ ...assessment, treatment: data }),
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
            <div>
              <FormHeader className="mt-4">Dysphagia Oral Phase</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"dysphagiaOralPhase"}
                  render={({ field }) => (
                    <FormRender label="CPT:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                Dysphagia Pharyngeal Phase
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"dysphagiaPharyngealPhase"}
                  render={({ field }) => (
                    <FormRender label="CPT:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Diet Level</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"dietLevel"}
                  render={({ field }) => (
                    <FormRender label="CPT:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Auditory Comprehension</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"auditoryComprehension"}
                  render={({ field }) => (
                    <FormRender label="CPT:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Verbal Expression</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"verbalExpression"}
                  render={({ field }) => (
                    <FormRender label="CPT:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Non Verbal Communication</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"nonVerbalCommunication"}
                  render={({ field }) => (
                    <FormRender label="CPT:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Other</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"other"}
                  render={({ field }) => (
                    <FormRender label="CPT:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Caregiver Training</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"caregiverTraining"}
                  render={({ field }) => (
                    <FormRender label="CPT:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Progress Note</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"progressNote"}
                  render={({ field }) => (
                    <FormRender label="CPT:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">MD Orders</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"mdOrders"}
                  render={({ field }) => (
                    <FormRender label="CPT:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">THERAPIST SIGNATURE</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"therapistSignature"}
                  render={({ field }) => (
                    <FormRender label="Signature:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"therapistSignatureDate"}
                  render={({ field }) => (
                    <FormRender label="Date:">
                      <DateInput {...field} value={field.value as Date} />
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

export default Treatment;
