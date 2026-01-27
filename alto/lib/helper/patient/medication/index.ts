import { parseDateString } from "@/lib";
import { medicationDefaultValue } from "@/schema/patient/medication";
import { PatientMedicationResponse } from "@/types";

export const getSelected = (obj: PatientMedicationResponse | null) => {
  if (obj) {
    return {
      ...obj,
      M1045InfluenzaVaccine: parseDateString(obj.M1045InfluenzaVaccine),
      M1055PneumococcalVaccine: parseDateString(obj.M1055PneumococcalVaccine),
      tetanusVaccine: parseDateString(obj.tetanusVaccine),
      otherVaccine: parseDateString(obj.otherVaccine),
      medicareAEffectiveDate: parseDateString(obj.medicareAEffectiveDate),
      medicareBEffectiveDate: parseDateString(obj.medicareBEffectiveDate),
      foleyCatheterDate: parseDateString(obj.foleyCatheterDate),
      primaryDx: obj.primaryDx.length
        ? {
            ...obj.primaryDx[0],
            date: parseDateString(obj.primaryDx[0]?.date),
          }
        : medicationDefaultValue.primaryDx,
      medication: obj.medication.length
        ? obj.medication.map((item) => ({
            ...item,
            date: parseDateString(item.date),
            dcDate: parseDateString(item.dcDate),
          }))
        : medicationDefaultValue.medication,
      otherDx: obj.primaryDx.slice(1).length
        ? obj.primaryDx
            .slice(1)
            .map((item) => ({ ...item, date: parseDateString(item.date) }))
        : medicationDefaultValue.otherDx,
      MIO12InpatientProcedure: obj.MIO12InpatientProcedure.length
        ? obj.MIO12InpatientProcedure.map((item) => ({
            ...item,
            date: parseDateString(item.date),
          }))
        : medicationDefaultValue.MIO12InpatientProcedure,
      serviceRequested: obj.serviceRequested.length
        ? obj.serviceRequested
        : medicationDefaultValue.serviceRequested,
    };
  } else return null;
};
