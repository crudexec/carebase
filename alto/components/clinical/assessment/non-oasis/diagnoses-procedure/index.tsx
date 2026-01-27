"use client";
import React from "react";

import { DiagnosisProcedureForm, HistoryAndDiagnosisForm } from "@/schema";

import DiagnosesProcedure from "./diagnoses";

const DiagnosisCodes = ({
  assessmentId,
  patientId,
  diagnosis,
  procedure,
  historyAndDiagnosis,
  dateCompleted,
  callback,
  disabled,
}: {
  assessmentId?: string;
  diagnosis?: DiagnosisProcedureForm[];
  procedure?: DiagnosisProcedureForm[];
  patientId: string;
  historyAndDiagnosis: HistoryAndDiagnosisForm;
  dateCompleted?: Date;
  callback: (assessmentId?: string) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="p-5">
      {["diagnosis", "procedure"].map((scope) => (
        <DiagnosesProcedure
          scope={scope as "diagnosis" | "procedure"}
          assessmentId={assessmentId as string}
          key={scope}
          data={scope === "diagnosis" ? diagnosis : procedure}
          patientId={patientId}
          historyAndDiagnosis={historyAndDiagnosis}
          dateCompleted={dateCompleted}
          callback={callback}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default DiagnosisCodes;
