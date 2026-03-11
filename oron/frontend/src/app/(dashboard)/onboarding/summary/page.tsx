"use client";

import { capitalizeFirstLetter } from "@/utils";
import Loader from "@/components/Loader";
import useUser from "@/hooks/useUser";
import PageContainer from "@/components/PageContainer";
import FormTableContainer from "./form-table-container";
import FormStats from "./form-stats";

const SummaryPage = () => {
  const { data, isLoading } = useUser();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <PageContainer>
      <h1 className="text-[22px] sm:text-[25px] md:text-[36px] font-[700] text-[#0F172A]">
        Welcome,{" "}
        {capitalizeFirstLetter(
          `${data?.data.first_name ?? "-"} ${data?.data.last_name ?? "-"}`
        )}
        👋
      </h1>
      <FormStats />
      <FormTableContainer />
    </PageContainer>
  );
};

export default SummaryPage;
