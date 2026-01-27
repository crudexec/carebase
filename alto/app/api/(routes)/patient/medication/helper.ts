import { PatientMedication } from "@prisma/client";

import prisma from "@/prisma";

import { isActive, orderBy } from "../../../lib";
import { filterFields } from "../../../lib/helper";

export const searchFilter = (
  columns: Partial<keyof PatientMedication>[],
  search: string,
) => {
  return search
    ? {
        OR: columns.map((field) => {
          return { [field]: { contains: search, mode: "insensitive" } };
        }),
      }
    : {};
};

export async function getMedications(
  providerId: string,
  sort?: string,
  search?: string,
  status?: string,
) {
  const sortFilter = orderBy(sort);
  const result = await prisma.$transaction([
    prisma.patientMedication.count({
      where: { active: isActive(status), patient: { providerId: providerId } },
    }),
    prisma.patientMedication.findMany({
      where: {
        active: isActive(status),
        patient: { providerId: providerId },
        ...searchFilter(
          filterFields<PatientMedication>("patientMedication", [
            "functionLimits",
            "activitiesAndDiet",
            "M1045InfluenzaVaccine",
            "M1055PneumococcalVaccine",
            "tetanusVaccine",
            "otherVaccine",
            "foleyCatheterDate",
            "medicareAEffectiveDate",
            "medicareBEffectiveDate",
          ]),
          search as string,
        ),
      },
      include: {
        serviceRequested: true,
        primaryDx: true,
        medication: true,
        MIO12InpatientProcedure: true,
      },
      ...sortFilter,
    }),
  ]);
  return { medications: result[1], totalCount: result[0] };
}
