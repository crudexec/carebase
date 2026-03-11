"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { UserFormInfo } from "@/types/AdminTypes";
import {
  GeneratedFormType,
  GeneratedFormStatusWithIndex,
  GeneratedFormDateWithIndex,
} from "@/types/form-types/FormTypes";
import { FormTableContainer } from "@/components/forms/Columns";
import { format } from "date-fns";

const useFormSearch = (
  formData: FormTableContainer[],
  allFormsData: GeneratedFormType | UserFormInfo
) => {
  const [filteredData, setFilteredData] =
    useState<FormTableContainer[]>(formData);

  useEffect(() => {
    setFilteredData(formData);
  }, [formData]);

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();

    const updatedFilteredData = formData
      .map((form) => {
        const isOfferLetter = form.id === "offerLetter";
        const offerLetter = formData.find((item) => item.id === "offerLetter");

        const startDate =
          allFormsData?.createdDate &&
          typeof allFormsData.createdDate !== "boolean"
            ? (allFormsData.createdDate as GeneratedFormDateWithIndex)[form.id]
            : null;

        const submittedDate =
          allFormsData?.submittedDate &&
          typeof allFormsData.submittedDate !== "boolean"
            ? (allFormsData.submittedDate as GeneratedFormDateWithIndex)[
                form.id
              ]
            : null;

        const progress = isOfferLetter
          ? offerLetter?.progress?.toString()
          : allFormsData?.progress && typeof allFormsData.progress !== "boolean"
          ? (allFormsData.progress as GeneratedFormDateWithIndex)[form.id]
          : null;

        const formattedStartDate =
          startDate && !isNaN(new Date(startDate).getTime())
            ? format(new Date(startDate), "PPP")
            : "";

        const formattedSubmittedDate =
          submittedDate && !isNaN(new Date(submittedDate).getTime())
            ? format(new Date(submittedDate), "PPP")
            : "";

        return {
          ...form,
          status: isOfferLetter
            ? offerLetter?.status!
            : allFormsData?.status && typeof allFormsData.status !== "boolean"
            ? (allFormsData.status as GeneratedFormStatusWithIndex)[form.id]
            : form.status,
          started: isOfferLetter ? offerLetter?.started! : formattedStartDate,
          submittedDate: isOfferLetter
            ? offerLetter?.submittedDate!
            : formattedSubmittedDate,
          progress: progress ? parseInt(progress) : 0,
        };
      })
      .filter(
        (item) =>
          item.formName.toLowerCase().includes(query) ||
          item.submittedDate.toLowerCase().includes(query)
      );

    setFilteredData(updatedFilteredData);
  };

  return { filteredData, handleSearchInputChange };
};

export default useFormSearch;
