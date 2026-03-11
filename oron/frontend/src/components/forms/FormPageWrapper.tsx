"use client";

import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormTableContainer } from "./Columns";
import { FormTable } from "./FormTable";
import Loader from "../Loader";
import { FORMS } from "@/constants";
import useFormTableData from "@/hooks/forms/useFormTableData";
import useForms from "@/hooks/forms/useForms";
import useFormSearch from "@/hooks/forms/useFormSearch";
import useTabChange from "@/hooks/forms/useTabChange";
import { useQuery } from "@tanstack/react-query";
import { OfferLetterResponse } from "@/types/OfferLetterTypes";
import { retrieveOfferLetterForm } from "@/use-cases/forms";
import { formatDate } from "@/utils";

const FormPageWrapper = () => {
  const { data: allFormsData, isLoading, refetch } = useForms();
  const { formData } = useFormTableData(
    allFormsData?.status,
    allFormsData?.submittedDate,
    allFormsData?.progress,
    FORMS,
    allFormsData?.createdDate
  );

  const [updatedData, setUpdatedData] = useState(formData);

  const token = localStorage.getItem("token") as string;

  const {
    data: offerLetterData,
    isLoading: offerLetterLoading,
    refetch: refetchOfferLetter,
  } = useQuery<OfferLetterResponse | undefined>({
    queryKey: ["offerLetter"],
    queryFn: async () => await retrieveOfferLetterForm(token),
  });

  const [filteredData, setFilteredData] = useState(formData);

  const offerLetter =
    typeof offerLetterData !== "boolean" && typeof offerLetterData === "object"
      ? offerLetterData
      : undefined;

  const offerLetterObject: FormTableContainer = {
    id: "offerLetter",
    formName: "Offer Letter",
    progress: offerLetter?.data?.signed === true ? 100 : 0,
    started: offerLetter?.data?.created_at
      ? formatDate(new Date(offerLetter?.data?.created_at))
      : "-",
    submittedDate:
      offerLetter?.data?.signed === true
        ? offerLetter?.data?.updated_at &&
          formatDate(new Date(offerLetter?.data?.updated_at))
        : "-",
    route: "/onboarding/form/offer-letter",
    status: offerLetter?.data?.signed === true ? "Signed" : "Not Filled",
    formId: offerLetter?.data?.id ?? "-",
  };

  useEffect(() => {
    const modifiedData: FormTableContainer[] = offerLetterData
      ? [offerLetterObject, ...formData]
      : formData;

    setUpdatedData(modifiedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, offerLetterData]);

  const { filteredData: formFilteredData, handleSearchInputChange } =
    useFormSearch(updatedData, allFormsData!);
  const { filteredData: tabFilteredData, handleTabChange } = useTabChange(
    updatedData,
    allFormsData!
  );

  useEffect(() => {
    setFilteredData(formFilteredData);
  }, [formFilteredData]);

  useEffect(() => {
    setFilteredData(tabFilteredData);
  }, [tabFilteredData]);

  useEffect(() => {
    refetch();
    refetchOfferLetter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex flex-col gap-12">
      <div className="w-full flex flex-col lg:flex-row flex-wrap gap-5 justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-[30px] font-[600] text-[#101828]">Forms</h2>
          <p className="text-[16px] font-[400] text-[#475467]">
            Fill and manage your onboarding forms here
          </p>
        </div>
        <div className="relative flex items-center">
          <div className="absolute left-0 pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-[#94A3B8]" />
          </div>
          <Input
            placeholder="Search forms"
            className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black md:w-[336px] outline-none focus:border-none"
            onChange={handleSearchInputChange}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="md:grid w-[320px] md:w-[700px] xl:w-[850px] md:grid-cols-6 pl-[20rem] overflow-auto flex gap-5 md:px-5 md:py-0 items-center">
          <TabsTrigger value="all" onClick={() => handleTabChange("all")}>
            All
          </TabsTrigger>

          <TabsTrigger
            value="awaitingApproval"
            onClick={() => handleTabChange("awaitingApproval")}
          >
            Awaiting Approval
          </TabsTrigger>
          <TabsTrigger
            value="inProgress"
            onClick={() => handleTabChange("inProgress")}
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            onClick={() => handleTabChange("approved")}
          >
            Approved
          </TabsTrigger>
          <TabsTrigger
            value="notFilled"
            onClick={() => handleTabChange("notFilled")}
          >
            Not Filled
          </TabsTrigger>
          <TabsTrigger value="signed" onClick={() => handleTabChange("signed")}>
            Signed
          </TabsTrigger>
        </TabsList>
        {isLoading || offerLetterLoading ? (
          <Loader />
        ) : (
          <>
            <TabsContent value="all" className="mt-10">
              <FormTable data={filteredData} />
            </TabsContent>
            <TabsContent value="inProgress" className="mt-10">
              <FormTable data={filteredData} />
            </TabsContent>
            <TabsContent value="awaitingApproval" className="mt-10">
              <FormTable data={filteredData} />
            </TabsContent>
            <TabsContent value="approved" className="mt-10">
              <FormTable data={filteredData} />
            </TabsContent>
            <TabsContent value="notFilled" className="mt-10">
              <FormTable data={filteredData} />
            </TabsContent>
            <TabsContent value="signed" className="mt-10">
              <FormTable data={filteredData} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </section>
  );
};

export default FormPageWrapper;
