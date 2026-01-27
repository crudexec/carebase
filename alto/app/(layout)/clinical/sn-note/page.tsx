import * as React from "react";

import { PatientTable } from "@/components/clinical";

export default async function SkilledNursingNote() {
  return (
    <PatientTable
      title={"Skilled Nursing Visit Note"}
      route="clinical/sn-note"
    />
  );
}
