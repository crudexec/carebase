"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CalendarIcon, ClockIcon } from "@radix-ui/react-icons";
import { EmployeeEventType } from "@/components/events/employee-events/types";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import { capitalizeFirstLetter, formatDate } from "@/utils";
import { format } from "date-fns";
import Link from "next/link";
import { truncateText } from "@/utils/helpers";
import { retrieveClientById } from "@/use-cases/clients";

const ClientCard = ({ nextSchedule }: { nextSchedule: EmployeeEventType }) => {
  const token = localStorage.getItem("token") as string;

  const { data: clientData, isLoading: isLoadingClientData } = useQuery({
    queryKey: ["clientDetail", nextSchedule.clientId],
    queryFn: async () => await retrieveClientById(token, nextSchedule.clientId),
  });

  const clientDetails = clientData?.data[0];

  const displayProfilePicture = (): string => {
    return (
      clientDetails?.profile_picture ??
      "/assets/images/dashboard/emptyProfilePicture.svg"
    );
  };

  const fullName = capitalizeFirstLetter(
    `${
      clientDetails?.clientInformation?.first_name ??
      clientDetails?.first_name ??
      "-"
    } ${
      clientDetails?.clientInformation?.last_name ??
      clientDetails?.last_name ??
      "-"
    }`
  );

  const formattedDate = `${format(new Date(nextSchedule.start), "eeee")},
${formatDate(new Date(nextSchedule.end))}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 1 }}
      className="border-[1px] w-full bg-[#2563EB] h-fit xl:h-[300px] overflow-auto p-5 py-10 rounded-[12px] flex flex-col gap-5 justify-between"
    >
      {isLoadingClientData ? (
        <Loader height="h-full" />
      ) : (
        <div className="w-full h-full overflow-auto flex flex-col gap-5 justify-between">
          <div className="flex flex-wrap justify-center md:justify-start gap-5 items-center">
            <div className="relative w-[100px] h-[100px]">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <Image
                  src={displayProfilePicture()}
                  width={100}
                  height={100}
                  alt="avatar"
                  draggable="false"
                  className={`w-full h-full object-cover transition-opacity duration-300`}
                />
              </div>
            </div>

            <div className="flex items-center md:items-start flex-col gap-3">
              <h2 className="text-[18px] md:text-[24px] font-[600] text-white">
                {fullName}
              </h2>
              <h3 className="text-[15px] md:text-[18px] font-[400] text-[#CBD5E1]">
                {truncateText(
                  clientDetails?.clientInformation?.address_or_street ?? "-",
                  60
                )}
              </h3>
            </div>
          </div>

          <hr className="w-full border-[1px] border-gray-300" />

          <div className="flex flex-wrap justify-center md:justify-between lg:justify-center xl:justify-between items-center gap-5">
            <h3 className="text-[14px] lg:text-[18px] font-[400] flex items-center gap-3 text-white">
              <CalendarIcon className="w-5 h-5" />
              {formattedDate}
            </h3>

            <h3 className="text-[14px] lg:text-[18px] font-[400] flex items-center gap-3 text-white">
              <ClockIcon className="w-5 h-5" />
              {nextSchedule.content.start}
            </h3>

            <Link
              href="/schedule"
              className="text-[12px] md:text-[15px] font-[400] flex items-center gap-3 text-black bg-white hover:bg-gray-200 rounded-[8px] px-5 py-3"
            >
              View Schedule <CalendarIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ClientCard;
