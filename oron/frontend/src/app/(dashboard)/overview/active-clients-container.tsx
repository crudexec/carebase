"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import NoActivity from "./no-activity";
import { ClientsTable } from "@/components/clients/ClientsTable";
import useCustomQuery from "@/hooks/useCustomQuery";
import { FullIntakeType } from "@/types/IntakeForm";
import { retrievEmployeeFullIntakeForm } from "@/use-cases/new-intake";
import { capitalizeFirstLetter, formatDate } from "@/utils";
import {
  formatClientStatus,
  sortDataByIntakeDate,
} from "@/components/clients/ClientsPageWrapper";
import { ClientsTableContainer } from "@/components/clients/ClientsColumns";
import Loader from "@/components/Loader";

const ActiveClientsCard = () => {
  const [noActivity, setNoActivity] = useState<boolean>(true);
  const { data, isLoading } = useCustomQuery<FullIntakeType | undefined>(
    "employeeFullIntake",
    retrievEmployeeFullIntakeForm,
    true
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  let intakeForm: FullIntakeType | undefined;

  if (typeof data === "boolean") {
    intakeForm = undefined;
  } else if (
    data &&
    "data" in data &&
    Array.isArray(data?.data) &&
    data?.data.length > 0
  ) {
    intakeForm = data;
  }

  useEffect(() => {
    if (
      intakeForm?.data?.some(
        (item) => formatClientStatus(item?.status) === "Active"
      )
    ) {
      setNoActivity(false);
    } else {
      setNoActivity(true);
    }
  }, [intakeForm]);

  const modifiedData = useMemo(() => {
    return (
      intakeForm?.data
        ?.map((item) => {
          const id = item?.id;
          const clientName = capitalizeFirstLetter(
            `${item.clientInformation?.first_name ?? item?.first_name ?? ""} ${
              item.clientInformation?.last_name ?? item?.last_name ?? ""
            }`
          );
          const location = item?.clientInformation?.country;
          const intakeDate = item?.created_at
            ? formatDate(new Date(item?.created_at))
            : "-";
          const waiverType: string = "";
          const status = formatClientStatus(item?.status ?? "");

          return {
            id: id,
            clientName: clientName,
            location: location,
            intakeDate: intakeDate,
            waiverType: waiverType,
            status: status,
            route: `/clients/${id}`,
          };
        })
        ?.filter((item) => item.status === "Active") ?? []
    );
  }, [intakeForm?.data]);

  const [filteredData, setFilteredData] =
    useState<ClientsTableContainer[]>(modifiedData);

  useEffect(() => {
    setFilteredData(modifiedData);
  }, [data, modifiedData]);

  const handleSearch = (event: { target: { value: string } }) => {
    const query = event.target.value;
    setSearchQuery(query);

    const filteredData = modifiedData.filter((item) =>
      item.clientName.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredData(filteredData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 3 }}
      className={`border-[1px] border-[#E4E4E7] h-fit md:max-h-[600px] xl:h-fit rounded-[8px] overflow-auto flex flex-col ${
        noActivity && "pb-5"
      } `}
    >
      {isLoading ? (
        <Loader height="h-full" />
      ) : (
        <>
          <div className="md:w-full p-5 flex flex-wrap gap-3 justify-between items-center sticky top-0 bg-white z-30">
            <h3 className="text-[#101828] text-[18px] font-[600]">
              Active Clients
            </h3>
            {!noActivity && (
              <Input
                placeholder="Search..."
                className="border-[#dbdbdc] border-[1.5px] placeholder:text-[#c9c9ca] text-black  md:w-[336px] outline-none focus:border-none px-5"
                value={searchQuery}
                onChange={handleSearch}
              />
            )}
          </div>
          {noActivity && (
            <NoActivity
              title="No Active Clients"
              description="Your active will appear here. Complete your onboarding to view your calendar and schedule."
            />
          )}
          {!noActivity && (
            <ClientsTable
              height="h-fit"
              data={sortDataByIntakeDate(filteredData)}
            />
          )}
        </>
      )}
    </motion.div>
  );
};

export default ActiveClientsCard;
