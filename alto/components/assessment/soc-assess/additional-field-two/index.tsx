"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import PromptModal from "@/components/prompt-modal";
import { Button, Form, Textarea } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData, validateVisitDate } from "@/lib";
import {
  additionalFieldTwoDefaultValue,
  AdditionalFieldTwoForm,
  additionalFieldTwoSchema,
} from "@/schema/assessment/soc-assess/additional-field-two";
import { SectionAForm } from "@/schema/assessment/soc-assess/section-a";
import { ObjectData } from "@/types";

import AdvancedDirective from "./advanced-directive";
import CardiacOrders from "./cardiac-order";
import Order from "./order";
import RehabilitationPotential from "./rehabilitation-potential";
import RenalOrders from "./renal-order";
import Therapy from "./therapy";

const AddtionalFieldTwo = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  timeIn,
  timeOut,
  visitDate,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionAForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  visitDate: Date;
  timeIn: string;
  timeOut: string;
  isQA: boolean;
}) => {
  const methods = useForm<AdditionalFieldTwoForm>({
    resolver: zodResolver(additionalFieldTwoSchema),
    defaultValues: additionalFieldTwoDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const {
    trigger: sendTOQA,
    isMutating: sendingToQA,
    data: response2,
  } = useSaveAssessment();
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
    if (response2?.success) {
      toast.success("Data sent to QA successfully!");
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response2]);

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

  const sendtoQA = async () => {
    if (validateVisitDate({ visitDate, timeIn, timeOut })) {
      await sendTOQA({
        nursingAssessment: parseData({
          ...assessment,
          cert485: methods.getValues(),
        }),
        patientScheduleId,
        caregiverId: authUser?.id as string,
        id: assessmentId,
        submittedAt: new Date(),
      });
    }
  };

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
        onSubmit={methods.handleSubmit(async (formData) => {
          trigger({
            socAccess: parseData({
              ...assessment,
              additionalFieldTwo: formData,
            }),
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
                <Button
                  className="px-6"
                  loading={sendingToQA}
                  variant="yellow"
                  type="button"
                  onClick={sendtoQA}
                >
                  Send to QA
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
            <AdvancedDirective methods={methods} />
            <CardiacOrders methods={methods} />
            <RenalOrders methods={methods} />
            <RehabilitationPotential methods={methods} />
            <Order methods={methods} />
            <Therapy methods={methods} />
          </div>
        </div>
        <div className="flex justify-end text-end mt-2  gap-2 pb-12 pr-5">
          {!isQA ? (
            <>
              <Button className="px-6" loading={isMutating}>
                Save Changes
              </Button>
              <Button
                className="px-6"
                loading={sendingToQA}
                variant="yellow"
                type="button"
                onClick={sendtoQA}
              >
                Send to QA
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

export default AddtionalFieldTwo;
