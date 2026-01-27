import * as React from "react";

import { PatientTable } from "@/components/clinical";

export default async function PlanOfCare() {
  return <PatientTable title={"POC Plus"} route="clinical/poc" />;
}
