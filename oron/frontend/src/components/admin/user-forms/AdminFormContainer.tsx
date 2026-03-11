"use client";

import { FC, ChangeEvent, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormTable } from "../../forms/FormTable";
import { FormTableContainer } from "@/components/forms/Columns";
import { Input } from "../../ui/input";
import Loader from "../../Loader";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { OfferLetterResponse } from "@/types/OfferLetterTypes";
import { fetchUserOfferLetter } from "@/use-cases/admin";
import { formatDate } from "@/utils";

interface Props {
  handleTabChange: (tabValue: string) => void;
  handleSearchInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  data: FormTableContainer[];
  formLoading: boolean;
  tab: string | null;
  id: string;
  isEmployeeManager?: boolean;
  baseRoute?: string;
}

const AdminFormContainer = ({
  handleTabChange,
  handleSearchInputChange,
  data,
  formLoading,
  tab,
  id,
  isEmployeeManager,
  baseRoute,
}: Props) => {
  const [filteredData, setFilteredData] = useState<FormTableContainer[]>(data);

  const token = localStorage.getItem("token") as string;
  const {
    data: offerLetterData,
    isLoading: offerLetterLoading,
    refetch: refetchOfferLetter,
  } = useQuery<OfferLetterResponse | boolean>({
    queryKey: ["offerLetter"],
    queryFn: async () => await fetchUserOfferLetter(id, token),
  });

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

  const statusOrder = [
    "Signed",
    "Approved",
    "Awaiting Approval",
    "In Progress",
    "Correction Required",
    "Not Filled",
  ];

  useEffect(() => {
    const modifiedData: FormTableContainer[] = offerLetterData
      ? [offerLetterObject, ...(data as FormTableContainer[])]
      : (data as FormTableContainer[]);

    const sortedData = modifiedData.sort(
      (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    );

    setFilteredData(sortedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, offerLetterData]);
  useEffect(() => {
    refetchOfferLetter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full gap-5">
      {formLoading || offerLetterLoading ? (
        <Loader height="h-[70vh]" />
      ) : (
        <Tabs defaultValue={tab ?? "all"} className="w-full h-full">
          <div className="flex items-center gap-5 justify-between flex-col xl:flex-row">
            <TabsList className="md:grid w-full xl:w-auto grid-cols-5 gap-2">
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
                Completed
              </TabsTrigger>
              <TabsTrigger
                value="notFilled"
                onClick={() => handleTabChange("notFilled")}
              >
                Not Filled
              </TabsTrigger>
            </TabsList>
            <div className="relative flex items-center w-full xl:w-auto">
              <div className="absolute left-0 pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-[#94A3B8]" />
              </div>
              <Input
                placeholder="Search forms"
                className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black w-full xl:w-[336px]"
                onChange={handleSearchInputChange}
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden mt-5">
            <TabsContent value="all" className="h-full">
              <FormTable admin={true} isEmployeeManager={isEmployeeManager} baseRoute={baseRoute} data={filteredData} />
            </TabsContent>
            <TabsContent value="inProgress" className="h-full">
              <FormTable admin={true} isEmployeeManager={isEmployeeManager} baseRoute={baseRoute} data={filteredData} />
            </TabsContent>
            <TabsContent value="awaitingApproval" className="h-full">
              <FormTable admin={true} isEmployeeManager={isEmployeeManager} baseRoute={baseRoute} data={filteredData} />
            </TabsContent>
            <TabsContent value="approved" className="h-full">
              <FormTable admin={true} isEmployeeManager={isEmployeeManager} baseRoute={baseRoute} data={filteredData} />
            </TabsContent>
            <TabsContent value="notFilled" className="h-full">
              <FormTable admin={true} isEmployeeManager={isEmployeeManager} baseRoute={baseRoute} data={filteredData} />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
};

export default AdminFormContainer;
