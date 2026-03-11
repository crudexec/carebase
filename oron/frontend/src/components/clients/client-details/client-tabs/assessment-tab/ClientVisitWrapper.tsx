"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { ClientVisitTypes } from "./ClientVisitColumns";
import { ClientVisitTable } from "./ClientVisitTable";
import Image from "next/image";
import Button from "@/components/button/Button";
import LogVisitDialog from "../../LogVisitDialog";
import { formatLastModified, formatVisitDate } from "@/utils/helpers";
import Loader from "@/components/Loader";
import { VisitData } from "@/types/Visit";
import VisitPdfModal from "./VisitPdfModal";
import { TreatmentPlanFormTabOptionIdType } from "../../ClientDetailPageWrapper";
import { getVisitFormRoute } from "@/utils/treatmentPlanHelpers";

const EmptyVisitMessage = ({
  admin,
  username,
  clientId,
  formType,
}: {
  admin?: boolean;
  username: string;
  clientId: string;
  formType: TreatmentPlanFormTabOptionIdType;
}) => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="p-5 flex flex-col gap-5 items-center justify-center">
      <Image
        src="/assets/images/dashboard/noVisitIcon.svg"
        width={200}
        height={200}
        alt="no visit icon"
      />

      <h2 className="text-[#0F172A] text-[16px] font-[700]">
        No Visits Logged Yet
      </h2>
      <p className="text-[#64748B] text-[12px] font-[400] text-center lg:w-[396px]">
        {!admin
          ? "This client doesn't have any logged visits yet. Ready to add the first visit?"
          : "This client doesn't have any logged visits yet. Visits will appear here once they are recorded by staff."}
      </p>

      <Button type="button" onClick={() => setOpenModal(true)}>
        <PlusIcon className="text-white w-5 h-5" />
        Log New Visit
      </Button>

      <LogVisitDialog
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
        username={username}
        clientId={clientId}
        admin={admin}
        formType={formType}
      />
    </div>
  );
};

export const transformVisitsToClientVisitTypes = (
  visits: VisitData[],
  admin: boolean,
  clientId: string,
  formType: TreatmentPlanFormTabOptionIdType
): ClientVisitTypes[] => {
  return visits.map((data) => ({
    id: data.id,
    staff: `${data.staff.first_name} ${data.staff.last_name}`,
    date: formatVisitDate(data.date_of_visit),
    lastModified: formatLastModified(data.updated_at),
    date_of_visit: data.date_of_visit,
    intake_full_id: data.intake_full_id,
    start_time: data.start_time,
    end_time: data.end_time,
    status: data.status ?? "draft",
    route: admin
      ? `/admin/clients/${clientId}/visits/${getVisitFormRoute(
          formType
        )}?formId=${data.id}&admin=true`
      : `/clients/${clientId}/visits/${getVisitFormRoute(formType)}?formId=${
          data.id
        }`,
    admin: admin,
    visitData: data,
    downloadLink: admin
      ? `/admin/clients/${clientId}/visits/${getVisitFormRoute(
          formType
        )}?formId=${data.id}&admin=true`
      : `/clients/${clientId}/visits/${getVisitFormRoute(formType)}?formId=${
          data.id
        }`,
  }));
};

const ClientVisitWrapper = ({
  filteredVisitData,
  isFetchingVisitData,
  originalVisitData,
  admin,
  username,
  formType,
}: {
  filteredVisitData: ClientVisitTypes[];
  isFetchingVisitData: boolean;
  originalVisitData: VisitData[];
  admin?: boolean;
  username: string;
  formType: TreatmentPlanFormTabOptionIdType;
}) => {
  const params = useParams<{ clientId: string }>();

  return (
    <section className="flex flex-col mt-5 gap-5">
      {isFetchingVisitData ? (
        <Loader height="h-[50px]" />
      ) : originalVisitData.length === 0 ? (
        <div className="w-full h-fit lg:px-5 border-[1px] border-[#E4E4E7] rounded-[12px]">
          <EmptyVisitMessage
            admin={admin}
            username={username}
            clientId={params.clientId}
            formType={formType}
          />
        </div>
      ) : (
        <ClientVisitTable data={filteredVisitData}   formType={formType} />
      )}

      <VisitPdfModal formType={formType} />
    </section>
  );
};

export default ClientVisitWrapper;
