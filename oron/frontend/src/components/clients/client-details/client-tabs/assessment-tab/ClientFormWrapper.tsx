"use client";

import { ClientTreatmentPlanTableTypes } from "./ClientFormColumns";
import { ClientFormTable } from "./ClientFormTable";
import { useParams } from "next/navigation";
import TreatmentModal from "../../../TreatmentPreviewModal";
import { TreatmentPlan } from "@/types/Events";
import useModal from "@/context/modal";
import { TreatmentPlanFormTabOptionIdType } from "../../ClientDetailPageWrapper";
import TreatmentPlanPdfModal from "./TreatmentPlanPdfModal";

const ClientFormWrapper = ({
  admin,
  treatmentPlanData,
  filteredData,
  formType,
}: {
  admin?: boolean;
  treatmentPlanData: TreatmentPlan | undefined;
  filteredData: ClientTreatmentPlanTableTypes[];
  formType: TreatmentPlanFormTabOptionIdType;
}) => {
  const params = useParams<{ clientId: string }>();
  const { isModalOpen } = useModal("PREVIEW_MODAL");

  const modifiedData = filteredData.filter((data) => {
    if (!admin) {
      return (
        data?.status === "completed" ||
        data?.status === "awaiting_signature" ||
        data?.status === "signed" ||
        data?.status === "not_sent"
      );
    }
    return true;
  });

  return (
    <section className="w-full flex flex-col gap-5">
      <ClientFormTable data={modifiedData} admin={admin} />

      <TreatmentPlanPdfModal
        clientId={params.clientId}
        formType={formType}
        admin={admin}
      />
    </section>
  );
};

export default ClientFormWrapper;
