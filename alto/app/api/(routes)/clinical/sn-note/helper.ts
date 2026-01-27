import { getImageUrl, isActive } from "@/app/api/lib";
import prisma from "@/prisma";

export async function getSkilledNursingNotes(
  patientId?: string,
  status?: string,
) {
  const result = await prisma.skilledNursingNote.findMany({
    where: {
      patientId,
      active: isActive(status),
    },
    select: {
      id: true,
      patient: {
        select: {
          patientAdmission: {
            select: {
              status: true,
              actionDate: true,
            },
          },
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      caregiver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      snNoteType: true,
      vitalSigns: {
        select: { startTime: true },
      },
      qASignature: {
        select: { status: true },
      },
      unscheduledVisit: {
        select: {
          patientSignature: true,
          caregiverSignature: true,
        },
      },
    },
  });
  return { snNotes: result, totalCount: result.length };
}

export const getSkilledNursingNote = async (
  skilledNursingNoteId: string,
  providerId: string,
) => {
  const snNote = await prisma.skilledNursingNote.findUnique({
    where: { id: skilledNursingNoteId },
    include: {
      caregiver: true,
      vitalSigns: true,
      cardioPulm: true,
      patient: {
        include: {
          patientAdmission: true,
        },
      },
      neuroGastro: true,
      genitoEndo: true,
      noteMedication: true,
      notePlan: true,
      qASignature: {
        include: {
          nurseSignature: true,
          patientSignature: true,
        },
      },
      skinAndWound: {
        include: {
          woundcare: true,
        },
      },
      unscheduledVisit: {
        include: {
          patientSignature: true,
          caregiverSignature: true,
        },
      },
      noteIntervention: true,
      noteIntervInst: true,
    },
  });

  return {
    ...snNote,
    qASignature: {
      ...snNote?.qASignature,
      nurseSignatureUrl: await getImageUrl(
        providerId,
        snNote?.qASignature?.nurseSignature?.mediaId,
      ),
      patientSignatureUrl: await getImageUrl(
        providerId,
        snNote?.qASignature?.patientSignature?.mediaId,
      ),
    },
  };
};

export const createSkilledNote = async ({
  unscheduledVisitId,
  patientId,
  caregiverId,
  snNoteType,
  providerId,
}: {
  unscheduledVisitId: string;
  patientId: string;
  caregiverId: string;
  snNoteType: string;
  providerId: string;
}) => {
  let skilledNursingNote;
  if (unscheduledVisitId) {
    skilledNursingNote = await prisma.skilledNursingNote.upsert({
      where: { unscheduledVisitId },
      update: {},
      create: {
        caregiverId,
        patientId,
        unscheduledVisitId,
        snNoteType,
        providerId,
      },
    });
  } else {
    skilledNursingNote = await prisma.skilledNursingNote.create({
      data: { caregiverId, patientId, snNoteType, providerId },
    });
  }

  return skilledNursingNote;
};
