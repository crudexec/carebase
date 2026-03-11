"use client";

import { useState, useEffect, useCallback } from "react";
import { RequestMethod } from "@/types/GeneralTypes";
import useUser from "@/hooks/useUser";
import useCustomQuery from "@/hooks/useCustomQuery";
import { BiodataFormResponse } from "@/types/form-types/FormTypes";
import { retrieveBioDataForm } from "@/use-cases/forms";
import { BiodataType } from "./schema";
import { UseFormReturn } from "react-hook-form";
import { handleBiodataSubmission } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { formatPhoneNumber, formatSSN } from "@/utils/helpers";

const useBiodataLogic = (form: UseFormReturn<BiodataType>) => {
  const { toast } = useToast();

  const [requestMethod, setRequestMethod] = useState<RequestMethod>("POST");
  const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);
  const [isFormApproved, setIsFormApproved] = useState<boolean>(false);
  const [isFormAwaitingApproval, setIsFormAwaitingApproval] =
    useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const { data: user, isLoading: userDataLoading } = useUser();
  const {
    data,
    isLoading: biodataLoading,
    refetch,
  } = useCustomQuery<BiodataFormResponse | undefined>(
    "biodata",
    retrieveBioDataForm
  );

  // 1) Create a new variable to hold the data or undefined state
  let biodata: BiodataFormResponse | undefined;
  // 2) If the data gotten from the server is boolean, then the data doesn't exist
  if (typeof data === "boolean") {
    // 3) Set the variable to undefined
    biodata = undefined;
  } else if (data) {
    // 4) Else set the variable to to the new data
    biodata = data;
  }

  // Prefill the form values
  const updateFieldWithBiodataInfo = useCallback(() => {
    form.setValue("lastName", biodata?.data?.last_name ?? "");
    form.setValue("firstName", biodata?.data?.first_name ?? "");
    form.setValue("email", biodata?.data?.email ?? "");
    form.setValue(
      "phoneNumber",
      biodata?.data?.phone ? formatPhoneNumber(biodata?.data?.phone) : ""
    );
    form.setValue("address", biodata?.data?.address ?? "");
    form.setValue("city", biodata?.data?.city ?? "");
    form.setValue("state", biodata?.data?.state ?? "");
    form.setValue("zipCode", biodata?.data?.zip_code ?? "");
    form.setValue(
      "socialSecurityNumber",
      biodata?.data?.social_security_number
        ? formatSSN(biodata?.data?.social_security_number)
        : ""
    );
    form.setValue("middleName", biodata?.data?.middle_name ?? "");
    form.setValue("otherLastName", biodata?.data?.other_last_name ?? "");
    form.setValue("apartmentNumber", biodata?.data?.apartment_number ?? "");
    form.setValue("npi", biodata?.data?.npi ?? "");
    form.setValue("lba", biodata?.data?.lba ?? "");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biodata]);

  const updateFieldWithUserInfo = useCallback(() => {
    form.setValue("lastName", user?.data?.last_name ?? "");
    form.setValue("firstName", user?.data?.first_name ?? "");
    form.setValue("email", user?.data?.email ?? "");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (biodata) {
      updateFieldWithBiodataInfo();
    } else {
      updateFieldWithUserInfo();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biodata, user]);

  useEffect(() => {
    if (biodata && Object.keys(biodata).length > 0) {
      setRequestMethod("PATCH");
    }

    if (
      (biodata && biodata?.data?.status === "awaiting_approval") ||
      biodata?.data?.status === "approved"
    ) {
      setIsFormDisabled(true);
    }

    if (biodata && biodata?.data?.status === "approved") {
      setIsFormApproved(true);
    }

    if (biodata && biodata?.data?.status === "awaiting_approval") {
      setIsFormAwaitingApproval(true);
    }
  }, [biodata]);

  const onSubmit = async (values: BiodataType) => {
    const token = localStorage.getItem("token") as string;

    const response = await handleBiodataSubmission(
      values,
      token,
      requestMethod
    );

    if (!response.status) {
      toast({
        variant: "destructive",
        description: response.errorMessage,
      });
      return;
    }

    setOpenModal(true);
    setJustSubmitted(true);
  };

  return {
    requestMethod,
    isFormDisabled,
    user,
    userDataLoading,
    biodata,
    biodataLoading,
    refetch,
    onSubmit,
    openModal,
    closeModal: () => setOpenModal(false),
    justSubmitted,
    isFormApproved,
    isFormAwaitingApproval,
  };
};

export default useBiodataLogic;
