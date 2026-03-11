"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components//ui/input";
import { motion } from "framer-motion";
import Loader from "@/components/Loader";
import { FORMS } from "@/constants";
import useFormTableData from "@/hooks/forms/useFormTableData";
import useForms from "@/hooks/forms/useForms";
import { FormTable } from "@/components/forms/FormTable";
import { OfferLetterResponse } from "@/types/OfferLetterTypes";
import { FormTableContainer as FormTableType } from "@/components/forms/Columns";
import { formatDate } from "@/utils";
import { retrieveOfferLetterForm } from "@/use-cases/forms";
import { useQuery } from "@tanstack/react-query";

const FormTableContainer = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: formStatusData, isLoading, refetch } = useForms();
  const { formData } = useFormTableData(
    formStatusData?.status,
    formStatusData?.submittedDate,
    formStatusData?.progress,
    FORMS,
    formStatusData?.createdDate
  );

  const token = localStorage.getItem("token") as string;
  const {
    data: offerLetterData,
    isLoading: offerLetterLoading,
    refetch: refetchOfferLetter,
  } = useQuery<OfferLetterResponse | undefined>({
    queryKey: ["offerLetter"],
    queryFn: async () => await retrieveOfferLetterForm(token),
  });

  const [data, setData] = useState(formData);

  const offerLetter =
    typeof offerLetterData !== "boolean" && typeof offerLetterData === "object"
      ? offerLetterData
      : undefined;

  const offerLetterObject: FormTableType = {
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
    const modifiedData: FormTableType[] = offerLetterData
      ? [offerLetterObject, ...formData]
      : formData;

    setData(modifiedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, offerLetterData]);

  useEffect(() => {
    refetch();
    refetchOfferLetter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (event: { target: { value: string } }) => {
    const query = event.target.value;
    setSearchQuery(query);

    const modifiedData: FormTableType[] = offerLetterData
      ? [offerLetterObject, ...formData]
      : formData;

    const filteredData = modifiedData.filter((item) =>
      item.formName.toLowerCase().includes(query.toLowerCase())
    );

    setData(filteredData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 3 }}
      className="border-[1px] border-[#E4E4E7] h-fit md:max-h-[600px] xl:h-[500px] rounded-[8px] overflow-auto flex flex-col w-full"
    >
      <div className="md:w-full p-5 flex flex-wrap gap-3 justify-between items-center sticky top-0 bg-white z-30">
        <h3 className="text-[#101828] text-[18px] font-[600]">Forms</h3>
        <Input
          placeholder="Search..."
          className="border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black  md:w-[336px] outline-none focus:border-none px-5"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {isLoading || offerLetterLoading ? <Loader /> : <FormTable data={data} />}
    </motion.div>
  );
};

export default FormTableContainer;
