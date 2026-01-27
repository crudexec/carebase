import * as React from "react";

import { PatientTable } from "@/components/clinical";

export default async function Assessment() {
  return (
    <PatientTable
      title="Assessments (OASIS/NON-OASIS)"
      route="clinical/assessment"
    />
  );
}
