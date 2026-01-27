"use client";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PromptModal from "@/components/prompt-modal";
import { Button, Textarea } from "@/components/ui";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { DiagnosisProcedureForm } from "@/schema";
import { ObjectData } from "@/types";

import DiagnosesProcedure from "./diagnoses";

const DiagnosisCodes = ({
  assessmentId,
  patientScheduleId,
  mutate,
  diagnosis,
  procedure,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  diagnosis?: DiagnosisProcedureForm[];
  procedure?: DiagnosisProcedureForm[];
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const {
    trigger: updateQAStatus,
    isMutating: updating,
    data: updateresponse,
  } = useUpdateQAStatus();
  const [action, setAction] = useState<QAStatus>();
  const [qaComment, setQaComment] = useState("");

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
    <div className="p-5">
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
      {isQA && (
        <div className="flex justify-end text-end mt-2 gap-2">
          <Button
            className="px-6"
            loading={updating}
            type="button"
            onClick={() => {
              setAction("APPROVED");
            }}
          >
            Approve
          </Button>{" "}
          <Button
            className="px-6"
            loading={updating}
            variant="destructive"
            type="button"
            onClick={() => {
              setAction("REJECTED");
            }}
          >
            Disapprove
          </Button>{" "}
        </div>
      )}
      {["diagnosis", "procedure"].map((scope) => (
        <DiagnosesProcedure
          scope={scope as "diagnosis" | "procedure"}
          assessmentId={assessmentId as string}
          key={scope}
          data={scope === "diagnosis" ? diagnosis : procedure}
          patientScheduleId={patientScheduleId}
          mutate={mutate}
          assessment={assessment}
          isQA={isQA}
        />
      ))}
    </div>
  );
};

export default DiagnosisCodes;
