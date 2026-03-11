"use client";

import Button from "../../../button/Button";
import FormInput from "../../../input-fields/FormInput";
import { useReferenceFormLogic } from "..";
import { ChangeEvent, useEffect, useState } from "react";
import { REDUCER_ACTION_TYPE } from "../logic/reducer";
import {
  getReferenceData,
  handleReferenceFormSubmission,
} from "../logic/reference-form";
import { ReferenceFormData } from "@/utils/schemas";
import { API_BASE_URL } from "@/constants";
import { useSuduReferenceFormValidation } from "../logic/useReferenceFormValidation";
import { useRouter } from "next/navigation";
import { formatPhoneNumber, revertFormattedPhoneNumber } from "@/utils/helpers";
import { useToast } from "@/components/ui/use-toast";
import FormBanner from "@/components/banner/FormBanner";
import FormSuggestionDialog from "@/components/FormSuggestionDialog";
import FormDisabledModal from "../../FormDisabledModal";
import FormApprovedModal from "../../FormApprovedModal";
import isOnline from "is-online";

const ReferenceForm = () => {
  const { state, dispatch } = useReferenceFormLogic();
  const { handleFormValidation } = useSuduReferenceFormValidation(dispatch);
  const { toast } = useToast();
  const [prev, setPrev] = useState(null);
  const [data, setData] = useState<any>();
  const { isFormDisabled, error } = state;
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      const { isFormValid } = handleFormValidation(state.formData);

      if (!isFormValid) return;

      const online = await isOnline();
      if (!online) {
        return {
          status: false,
          errorMessage:
            "No internet connection. Please check your connection and try again.",
        };
      }

      const token = localStorage.getItem("token") as string;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(`${API_BASE_URL}/referenceForm/submit`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(state.formData),
      });

      if (!response.ok) {
        return {
          errorMessage: "Invalid response status, Please try again",
          status: false,
        };
      }

      setOpenModal(true);
      setJustSubmitted(true);

      const clientResponse = {
        errorMessage: "",
        status: true,
      };

      return clientResponse;
    } catch (error: any) {
      const clientResponse: any = {
        errorMessage:
          error?.response?.data?.errorMessage ??
          "A network errror occurred! Try again",
        status: false,
      };
      return clientResponse; // Error occurred during login
    }
  };

  const handleChange = async (
    e: ChangeEvent<HTMLInputElement>,
    field?: "phoneNumber"
  ) => {
    let value = e.target.value;
    if (field === "phoneNumber") {
      value = formatPhoneNumber(value);
    }

    dispatch({
      type: REDUCER_ACTION_TYPE.SET_FORM_DATA_FIELD,
      payload: {
        key: e.target.name,
        value: field === "phoneNumber" ? value : e.target.value,
      },
    });
  };

  const handleBlur = async (
    event: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const token = localStorage.getItem("token") as string;

    const res = await handleReferenceFormSubmission(
      {
        ...state.formData,
        referrer_one_phone: revertFormattedPhoneNumber(
          state.formData.referrer_one_phone
        ),
        referrer_two_phone: revertFormattedPhoneNumber(
          state.formData.referrer_two_phone
        ),
        referrer_three_phone: revertFormattedPhoneNumber(
          state.formData.referrer_three_phone
        ),
      },
      token,
      prev ? "PATCH" : "POST"
    );

    if (res) {
      setPrev(res as any);
    }
  };

  useEffect(() => {
    const getRefDataFunc = async () => {
      try {
        const token = localStorage.getItem("token") as string;
        const data = await getReferenceData(token);

        setPrev(data);

        if (data && data !== null && typeof data === "object") {
          if (
            data?.status === "awaiting_approval" ||
            data?.status === "approved"
          ) {
            dispatch({
              type: REDUCER_ACTION_TYPE.SET_IS_FORM_DISABLED,
              payload: {
                isFormDisabled: true,
              },
            });
          }

          setData(data);
          dispatch({
            type: REDUCER_ACTION_TYPE.SET_FORM_DATA,
            payload: {
              formData: {
                referrer_one_firstname: data?.referrer_one_firstname ?? "",
                referrer_one_lastname: data?.referrer_one_lastname ?? "",
                referrer_one_email: data?.referrer_one_email ?? "",
                referrer_one_phone: formatPhoneNumber(
                  data?.referrer_one_phone ?? ""
                ),
                referrer_two_firstname: data?.referrer_two_firstname ?? "",
                referrer_two_lastname: data?.referrer_two_lastname ?? "",
                referrer_two_email: data?.referrer_two_email ?? "",
                referrer_two_phone: formatPhoneNumber(
                  data?.referrer_two_phone ?? ""
                ),
                referrer_three_firstname: data?.referrer_three_firstname ?? "",
                referrer_three_lastname: data?.referrer_three_lastname ?? "",
                referrer_three_email: data?.referrer_three_email ?? "",
                referrer_three_phone: formatPhoneNumber(
                  data?.referrer_three_phone ?? ""
                ),
              },
            },
          });
        }
      } catch (error) {}
    };

    getRefDataFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFormDataValue = (key: keyof ReferenceFormData) => {
    if (state.formData) {
      return state?.formData[key];
    }
  };

  return (
    <form
      action={() => {
        handleSubmit();
      }}
      className="w-full flex flex-col gap-10"
    >
      {data?.status === "awaiting_approval" && !justSubmitted && (
        <FormDisabledModal />
      )}
      {data?.status === "approved" && (
        <FormApprovedModal formName="Reference Form" />
      )}

      {openModal && (
        <FormSuggestionDialog
          formName="Reference Form"
          openModal={openModal}
          closeModal={() => setOpenModal(false)}
          formId="refForm"
        />
      )}
      {data?.status === "reviewed" && (
        <FormBanner variant="warning" text={data?.review_notes} />
      )}

      <div className="w-full flex justify-between items-center gap-5 flex-wrap">
        <h2 className="text-[30px] font-[600] text-[#101828]">
          Reference Form
        </h2>
        <Button disabled={isFormDisabled} type="submit">
          {isFormDisabled ? "Update" : "Submit"}
        </Button>
      </div>

      <div className="w-full flex flex-col gap-7 lg:pb-[150px]">
        <div className="w-full border-[1px] border-[#EAECF0] shadow-sm p-5 lg:p-5 flex flex-col gap-5 rounded-[12px]">
          <h3 className="text-[#0F172A] font-[700] text-[20px]">Referrer 1</h3>

          <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
            <FormInput
              disabled={isFormDisabled}
              name="referrer_one_firstname"
              placeholder="Enter referrer's first name here"
              type="text"
              labelText="First Name"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Referrer one first name")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Referrer one first name")
                )
              }
              onBlur={handleBlur}
              onChange={handleChange}
              value={getFormDataValue("referrer_one_firstname")}
            />

            <FormInput
              disabled={isFormDisabled}
              name="referrer_one_lastname"
              placeholder="Enter referrer's last name here"
              type="text"
              labelText="Last Name"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Referrer one last name")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Referrer one last name")
                )
              }
              onChange={handleChange}
              value={getFormDataValue("referrer_one_lastname")}
              onBlur={handleBlur}
            />
          </div>
          <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
            <FormInput
              disabled={isFormDisabled}
              name="referrer_one_email"
              placeholder="Enter referrer's email address here"
              type="text"
              labelText="Email Address"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Invalid Referrer one email")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Invalid Referrer one email")
                )
              }
              value={getFormDataValue("referrer_one_email")}
              onBlur={handleBlur}
              onChange={handleChange}
            />

            <FormInput
              disabled={isFormDisabled}
              name="referrer_one_phone"
              placeholder="+1 (555) 000-0000"
              type="text"
              labelText="Phone Number"
              isAuth={false}
              withSelect={true}
              selectDefaultValue="US"
              onBlur={handleBlur}
              selectValue={["US"]}
              errorMessage={error.message.find((message) =>
                message.includes("Referrer one phone number")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Referrer one phone number")
                )
              }
              value={getFormDataValue("referrer_one_phone")}
              onChange={(e) => handleChange(e, "phoneNumber")}
            />
          </div>
        </div>

        <div className="w-full border-[1px] border-[#EAECF0] shadow-sm p-5 lg:p-5 flex flex-col gap-5 rounded-[12px]">
          <h3 className="text-[#0F172A] font-[700] text-[20px]">Referrer 2</h3>

          <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
            <FormInput
              disabled={isFormDisabled}
              name="referrer_two_firstname"
              placeholder="Enter referrer's first name here"
              type="text"
              labelText="First Name"
              isAuth={false}
              onBlur={handleBlur}
              errorMessage={error.message.find((message) =>
                message.includes("Referrer two first name")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Referrer two first name")
                )
              }
              value={getFormDataValue("referrer_two_firstname")}
              onChange={handleChange}
            />

            <FormInput
              disabled={isFormDisabled}
              name="referrer_two_lastname"
              placeholder="Enter referrer's last name here"
              type="text"
              labelText="Last Name"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Referrer two last name")
              )}
              onBlur={handleBlur}
              isError={
                !!error.field.find((field) =>
                  field.includes("Referrer two last name")
                )
              }
              value={getFormDataValue("referrer_two_lastname")}
              onChange={handleChange}
            />
          </div>
          <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
            <FormInput
              disabled={isFormDisabled}
              name="referrer_two_email"
              placeholder="Enter referrer's email address here"
              type="text"
              labelText="Email Address"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Invalid Referrer two email")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Invalid Referrer two email")
                )
              }
              value={getFormDataValue("referrer_two_email")}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <FormInput
              disabled={isFormDisabled}
              name="referrer_two_phone"
              placeholder="+1 (555) 000-0000"
              type="text"
              labelText="Phone Number"
              isAuth={false}
              withSelect={true}
              selectDefaultValue="US"
              selectValue={["US"]}
              errorMessage={error.message.find((message) =>
                message.includes("Referrer two phone number")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Referrer two phone number")
                )
              }
              value={getFormDataValue("referrer_two_phone")}
              onChange={(e) => handleChange(e, "phoneNumber")}
              onBlur={handleBlur}
            />
          </div>
        </div>

        <div className="w-full border-[1px] border-[#EAECF0] shadow-sm p-5 lg:p-5 flex flex-col gap-5 rounded-[12px]">
          <h3 className="text-[#0F172A] font-[700] text-[20px]">Referrer 3</h3>

          <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
            <FormInput
              disabled={isFormDisabled}
              name="referrer_three_firstname"
              placeholder="Enter referrer's first name here"
              type="text"
              labelText="First Name"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Referrer three first name")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Referrer three first name")
                )
              }
              value={getFormDataValue("referrer_three_firstname")}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <FormInput
              disabled={isFormDisabled}
              name="referrer_three_lastname"
              placeholder="Enter referrer's last name here"
              type="text"
              labelText="Last Name"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Referrer three last name")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Referrer three last name")
                )
              }
              value={getFormDataValue("referrer_three_lastname")}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
            <FormInput
              disabled={isFormDisabled}
              name="referrer_three_email"
              placeholder="Enter referrer's email address here"
              type="text"
              labelText="Email Address"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Invalid Referrer three email")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Invalid Referrer three email")
                )
              }
              value={getFormDataValue("referrer_three_email")}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <FormInput
              disabled={isFormDisabled}
              name="referrer_three_phone"
              placeholder="+1 (555) 000-0000"
              type="text"
              labelText="Phone Number"
              isAuth={false}
              withSelect={true}
              selectDefaultValue="US"
              selectValue={["US"]}
              errorMessage={error.message.find((message) =>
                message.includes("Referrer three phone number")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Referrer three phone number")
                )
              }
              value={getFormDataValue("referrer_three_phone")}
              onChange={(e) => handleChange(e, "phoneNumber")}
              onBlur={handleBlur}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white w-full">
        <Button disabled={isFormDisabled} type="submit">
          {isFormDisabled ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default ReferenceForm;
