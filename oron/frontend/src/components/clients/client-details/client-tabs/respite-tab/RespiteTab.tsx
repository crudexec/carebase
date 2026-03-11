"use client";

import { useState, useEffect } from "react";
import { PlusIcon, Search } from "lucide-react";
import { useParams } from "next/navigation";
import { RespiteTypes } from "./RespiteColumns";
import { RespiteTable } from "./RespiteTable";
import Image from "next/image";
import Button from "@/components/button/Button";
import NewRespiteModal from "./NewRespiteModal";
import Loader from "@/components/Loader";
import { formatVisitDate, formatLastModified } from "@/utils/helpers";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { retrieveAllRespiteForms } from "@/use-cases/respite";

const EmptyRespiteMessage = ({
  admin,
  username,
  clientId,
}: {
  admin?: boolean;
  username: string;
  clientId: string;
}) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  return (
    <div className="p-5 flex flex-col gap-5 items-center justify-center">
      <Image
        src="/assets/images/dashboard/noVisitIcon.svg"
        width={200}
        height={200}
        alt="no respite icon"
      />

      <h2 className="text-[#0F172A] text-[16px] font-[700]">
        No Respite Forms Yet
      </h2>
      <p className="text-[#64748B] text-[12px] font-[400] text-center lg:w-[396px]">
        {!admin
          ? "This client doesn't have any respite forms yet. Ready to add the first one?"
          : "This client doesn't have any respite forms yet. Forms will appear here once they are recorded by staff."}
      </p>

      <Button type="button" onClick={() => setIsNewModalOpen(true)} className="w-fit">
        <PlusIcon className="text-white w-5 h-5" />
        New Respite Form
      </Button>

      <NewRespiteModal
        open={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        clientId={clientId}
        admin={admin}
        username={username}
        refetchRespiteForms={() => {}}
      />
    </div>
  );
};

interface RespiteTabProps {
  clientId: string;
  admin?: boolean;
  username: string;
}

const RespiteTab = ({ clientId, admin, username }: RespiteTabProps) => {
  const params = useParams<{ clientId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const token = localStorage.getItem("token") ?? "";

  const {
    data: respiteData,
    isLoading: isFetchingRespiteData,
    refetch: refetchRespiteForms,
  } = useQuery({
    queryKey: ["respiteForms", clientId],
    queryFn: async () => {
      return await retrieveAllRespiteForms(token, clientId);
    },
  });

  const [originalRespiteData, setOriginalRespiteData] = useState<
    RespiteTypes[]
  >([]);

  useEffect(() => {
    if (isFetchingRespiteData) {
      setOriginalRespiteData([]);
      return;
    }

    if (respiteData?.data && Array.isArray(respiteData.data)) {
      const formattedData: RespiteTypes[] = respiteData.data.map((form) => ({
        id: form.id,
        date: formatVisitDate(form.date_of_visit),
        staff: `${form.staff.first_name} ${form.staff.last_name}`,
        lastModified: formatLastModified(form.updated_at),
        status: form.status,
        route: admin
          ? `/admin/clients/${clientId}/forms/respite?formId=${form.id}`
          : `/clients/${clientId}/forms/respite?formId=${form.id}`,
        admin: admin ?? false,
      }));

      setOriginalRespiteData(formattedData);
    }
  }, [respiteData, clientId, admin, isFetchingRespiteData]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (!respiteData?.data) return;

    const filteredData = respiteData.data
      .map((form) => ({
        id: form.id,
        date: formatVisitDate(form.date_of_visit),
        staff: `${form.staff.first_name} ${form.staff.last_name}`,
        lastModified: formatLastModified(form.updated_at),
        status: form.status,
        route: admin
          ? `/admin/clients/${clientId}/forms/respite?formId=${form.id}`
          : `/clients/${clientId}/forms/respite?formId=${form.id}`,
        admin: admin ?? false,
      }))
      .filter(
        (form) =>
          form.staff.toLowerCase().includes(query) ||
          form.date.toLowerCase().includes(query)
      );

    setOriginalRespiteData(filteredData);
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="w-full justify-between items-center gap-3 flex flex-wrap">
        <h1 className="text-[20px] text-[#101828] font-[600]">Respite Forms</h1>

        <div className="w-fit flex flex-wrap gap-3">
          <div className="md:w-fit w-full relative flex items-center">
            <div className="absolute left-0 pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black xl:w-[336px] outline-none focus:border-none"
            />
          </div>

          <Button
            className="md:w-fit w-full"
            type="button"
            onClick={() => setIsNewModalOpen(true)}
          >
            <PlusIcon className="text-white w-5 h-5" />
            New Respite
          </Button>
        </div>
      </div>

      {isFetchingRespiteData ? (
        <Loader height="h-[50px]" />
      ) : originalRespiteData.length === 0 ? (
        <div className="w-full h-fit lg:px-5 border-[1px] border-[#E4E4E7] rounded-[12px]">
          <EmptyRespiteMessage
            admin={admin}
            username={username}
            clientId={params.clientId}
          />
        </div>
      ) : (
        <RespiteTable data={originalRespiteData} admin={admin} />
      )}

      <NewRespiteModal
        open={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        clientId={clientId}
        admin={admin}
        username={username}
        refetchRespiteForms={refetchRespiteForms}
      />
    </div>
  );
};

export default RespiteTab;
