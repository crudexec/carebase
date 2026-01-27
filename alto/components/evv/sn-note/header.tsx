import Link from "next/link";
import React from "react";

import Detail from "@/components/detail";
import { formatDate, getFullName } from "@/lib";
import { PatientResponse } from "@/types";

const SNNoteHeader = ({ patient }: { patient: PatientResponse }) => {
  return (
    <div className="border p-4 rounded flex flex-col">
      <div>
        <p className="text-2xl pb-2 font-semibold uppercase">
          {getFullName(patient?.firstName, patient?.lastName)}
        </p>
        <div className="grid lg:grid-cols-2 gap-2 bg-secondary p-2 border text-sm">
          <Detail title="PAN" detail={patient?.pan} />
          <div className="flex items-center gap-3">
            <p className="font-bold">Admit Date:</p>
            <Link
              href={`/evv/${patient?.id}/admission`}
              className="cursor-pointer text-primary"
            >
              {formatDate(patient?.patientAdmission?.[0]?.createdAt)}
            </Link>
          </div>
          <Detail title="Date of Birth" detail={formatDate(patient?.dob)} />
          <Detail
            title="Allergies"
            detail={patient?.patientMedication?.allergies ?? "-"}
          />
        </div>
      </div>
    </div>
  );
};

export default SNNoteHeader;
