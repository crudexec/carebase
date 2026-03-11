"use client";

import FormBadge from "@/components/badge/FormBadge";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/Loader";
import useApproveForm from "@/hooks/admin/useApproveForm";
import { UserFormInfo } from "@/types/AdminTypes";
import useSendReview from "@/hooks/admin/useSendReview";
import FormBanner from "@/components/banner/FormBanner";
import BreadCrumb from "@/components/BreadCrumb";

const HepatitisReview = ({
  name,
  formInfo,
  id,
}: {
  name: string;
  formInfo: UserFormInfo | undefined;
  id: string;
}) => {
  const { mutate, isPending, hasApproved, formID } = useApproveForm(
    "hepatitis",
    name,
    "Hepatitis B Vaccination Attestation"
  );

  const {
    mutate: mutateReview,
    isPending: reviewPending,
    reviewNote,
    handleChange,
  } = useSendReview("hepatitis", name, formID!);

  return (
    <section className="flex flex-col gap-10 py-10">
      <BreadCrumb
        links={[
          { name: "Employees", route: "/admin" },
          {
            name: name,
            route: `/admin?name=${name}&id=${id}`,
          },
          {
            name: "Hepatitis B Vaccination Attestation",
            route: `/admin?name=${name}&id=${id}&form=hepatitisVaccination&formId=${formID}`,
          },
        ]}
      />

      <div className="flex justify-between gap-5 flex-wrap">
        <div className="flex flex-wrap gap-5 items-center">
          <h2 className="text-[#101828] text-[30px] font-[600]">
            Hepatitis B Vaccination Attestation
          </h2>
          <FormBadge
            status={
              reviewPending
                ? "Correction Required"
                : isPending
                ? "Approved"
                : formInfo?.status.hepatitisVaccination ?? "Not Filled"
            }
          >
            {reviewPending
              ? "Correction Required"
              : isPending
              ? "Approved"
              : formInfo?.status.hepatitisVaccination}
          </FormBadge>
        </div>
        <div className="flex gap-5 items-center">
          <Dialog>
            <DialogTrigger
              disabled={formInfo?.status.hepatitisVaccination === "Not Filled"}
            >
              {reviewPending && (
                <button
                  disabled
                  className="bg-[#e159598a] w-[160px] h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500 text-white"
                >
                  <Loader height="h-fit" />
                </button>
              )}

              {!reviewPending && (
                <button
                  disabled={
                    formInfo?.status.hepatitisVaccination === "Not Filled"
                  }
                  className="flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#c82d2d] disabled:cursor-not-allowed disabled:bg-[#e159598a] disabled:hover:bg-[#e159598a] text-white w-fit h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]"
                >
                  <Image
                    src="/assets/images/dashboard/reviewIcon.svg"
                    width={20}
                    height={20}
                    alt="info icon"
                  />
                  {formInfo?.status?.hepatitisVaccination ===
                  "Correction Required"
                    ? "Send Another Review"
                    : "Correction Required"}
                </button>
              )}
            </DialogTrigger>
            <DialogContent
              style={{
                boxShadow: "0 0 2000px rgba(0, 0, 0, 0.5)",
              }}
              className="bg-white rounded-[12px] flex flex-col gap-5 shadow-2xl shadow-black/50"
            >
              <div className="w-full flex gap-5 justify-center items-center ml-auto">
                <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
                  Correction Required
                </h2>
              </div>

              <p className="text-[14px] font-[400] text-[#475467] text-center">
                The feeback would be sent to the employee
              </p>

              <div className="flex flex-col gap-5 mt-3">
                <Textarea
                  value={reviewNote}
                  onChange={(e) => handleChange(e.target.value)}
                  id="review"
                  placeholder="Enter form review"
                />
              </div>

              <DialogFooter className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
                <DialogClose className="w-full bg-[#F1F5F9] rounded-[6px] px-5 py-3 h-fit text-black disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 justify-center">
                  Cancel
                </DialogClose>

                <DialogClose
                  onClick={() => {
                    mutateReview(name);
                  }}
                  className="w-full h-fit bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] px-5 py-3 text-white ddisabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 justify-center"
                >
                  Send Review
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isPending && (
            <button className="bg-[#6287d77e] w-[160px] h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500 text-white">
              <Loader height="h-fit" />
            </button>
          )}

          {!isPending && (
            <button
              disabled={
                formInfo?.status.hepatitisVaccination === "Not Filled" ||
                formInfo?.status.hepatitisVaccination === "Approved" ||
                hasApproved
              }
              onClick={() => mutate(name)}
              className={`flex items-center justify-center disabled:cursor-not-allowed gap-2 disabled:bg-[#6287d77e] ${
                formInfo?.status.hepatitisVaccination === "Not Filled" ||
                formInfo?.status.hepatitisVaccination === "Approved" ||
                hasApproved
                  ? "bg-[#039855]"
                  : "bg-[#2563EB] hover:bg-[#285bc9]"
              } text-white w-[160px] h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]`}
            >
              <Image
                src="/assets/images/dashboard/approveIcon.svg"
                width={20}
                height={20}
                alt="approve icon"
              />
              {formInfo?.status.hepatitisVaccination === "Approved" ||
              hasApproved
                ? "Approved"
                : "Approve"}
            </button>
          )}
        </div>
      </div>

      {formInfo?.status?.hepatitisVaccination === "Correction Required" && (
        <FormBanner
          variant="warning"
          text={
            formInfo?.forms?.hepatitisVaccination?.data?.hepatitisBFullForm
              ?.review_notes ?? ""
          }
        />
      )}

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-5 h-fit py-10 p-5 rounded-[12px]">
        <h2 className="text-[18px] font-[600] text-[#0F172A]">Attestation</h2>

        <div className="xl:w-full flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Please Select one
              </h2>

              {formInfo?.forms.hepatitisVaccination.data
                .hepatitisBAttestationForm &&
                Object.keys(
                  formInfo?.forms.hepatitisVaccination.data
                    .hepatitisBAttestationForm
                ).length < 1 && <p>-</p>}

              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.hepatitisVaccination.data
                  .hepatitisBAttestationForm
                  .arranged_for_hepatitis_b_vaccine_series_of_three &&
                  "I will make arrangements with my health care provider to get the Hepatitis B series of 3 vaccines"}
                {formInfo?.forms.hepatitisVaccination.data
                  .hepatitisBAttestationForm
                  .had_hepatitis_b_vaccine_series_of_three &&
                  "I have already had the Hepatitis B vaccination series of 3 vaccines."}
                {formInfo?.forms.hepatitisVaccination.data
                  .hepatitisBAttestationForm
                  .declined_hepatitis_b_vaccine_series_of_three &&
                  "I understand that due to my occupational exposure to blood or other potentially infectious materials that I may be at risk of acquiring Hepatitis B virus (HBV) infection. I have been given the opportunity to be vaccinated with the Hepatitis B vaccine, at no charge to myself. However, I decline the Hepatitis B vaccination at this time. I understand that by declining this vaccine, I continue to be at risk of acquiring the Hepatitis B infection, a serious disease. If in the future, I continue to have occupational exposure to blood or other potentially infectious materials and I change my mind."}
                {!formInfo?.forms.hepatitisVaccination.data
                  .hepatitisBAttestationForm
                  .arranged_for_hepatitis_b_vaccine_series_of_three ||
                  !formInfo?.forms.hepatitisVaccination.data
                    .hepatitisBAttestationForm
                    .had_hepatitis_b_vaccine_series_of_three ||
                  (!formInfo?.forms.hepatitisVaccination.data
                    .hepatitisBAttestationForm
                    .declined_hepatitis_b_vaccine_series_of_three &&
                    "-")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-5 h-fit py-10 p-5 rounded-[12px]">
        <h2 className="text-[18px] font-[600] text-[#0F172A]">Information</h2>

        <div className="xl:w-full flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.hepatitisVaccination.data
                  ?.personalInformationHepatitisBForm.last_name ?? "-"}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.hepatitisVaccination.data
                  ?.personalInformationHepatitisBForm.first_name ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HepatitisReview;
