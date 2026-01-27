import * as React from "react";

import { PatientTable } from "@/components/clinical";

export default async function PlanOfCare() {
  return (
    <PatientTable title={"485 Certification & POC"} route="clinical/cert485" />
  );
}
