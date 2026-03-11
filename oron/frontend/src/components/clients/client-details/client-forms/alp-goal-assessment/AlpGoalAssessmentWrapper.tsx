"use client";

import BreadCrumb from "@/components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import { retrieveClientById } from "@/use-cases/clients";
import { capitalizeFirstLetter } from "@/utils";
import { useCallback, useState } from "react";
import AlpGoalAssessmentForm from "./AlpGoalAssessmentForm";

interface Props {
  clientId: string;
  formId: string | null;
  admin?: boolean;
}

const AlpGoalAssessmentWrapper = ({ clientId, formId, admin }: Props) => {
  const token = localStorage.getItem("token") as string;
  const { data, isLoading } = useQuery({
    queryKey: ["clientDetail", clientId],
    queryFn: async () => await retrieveClientById(token, clientId),
  });

  const user = data?.data[0];
  const firstName =
    user?.clientInformation?.first_name ?? user?.first_name ?? "";
  const lastName = user?.clientInformation?.last_name ?? user?.last_name ?? "";

  const username = capitalizeFirstLetter(
    `${firstName?.toLowerCase()} ${lastName?.toLowerCase()}`
  );

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <BreadCrumb
          links={[
            { name: "Clients", route: admin ? "/admin/clients" : "/clients" },
            {
              name: username,
              route: admin
                ? `/admin/clients/${clientId}`
                : `/clients/${clientId}`,
            },
            {
              name: "ALP Assessment",
              route: "#",
            },
            {
              name: "Goal Assessment",
              route: admin
                ? `/admin/clients/${clientId}/forms/alp-goal-assessment`
                : `/clients/${clientId}/forms/alp-goal-assessment`,
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <span data-testid="intake-assessment-header">
              ALP Goal Assessment (19-21 Years)
            </span>
          </div>
          å
        </div>
      </div>

      <section className="relative w-full flex flex-col lg:flex-row lg:mt-0 xl:mt-[60px] mt-0">
        <AlpGoalAssessmentForm clientId={clientId} admin={admin} />
      </section>
    </div>
  );
};

export default AlpGoalAssessmentWrapper;
