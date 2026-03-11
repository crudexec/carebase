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

const FluVaccineReview = ({
  name,
  formInfo,
  id,
}: {
  name: string;
  formInfo: UserFormInfo | undefined;
  id: string;
}) => {
  const { mutate, isPending, hasApproved, formID } = useApproveForm(
    "flu",
    name,
    "Flu Vaccine Attestation and Declination"
  );

  const {
    mutate: mutateReview,
    isPending: reviewPending,
    reviewNote,
    handleChange,
  } = useSendReview("flu", name, formID!);

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
            name: "Flu Vaccine Attestation and Declination",
            route: `/admin?name=${name}&id=${id}&form=fluVaccine&formId=${formID}`,
          },
        ]}
      />

      <div className="flex justify-between gap-5 flex-wrap">
        <div className="flex flex-wrap gap-5 items-center">
          <h2 className="text-[#101828] text-[30px] font-[600]">
            Flu Vaccine Attestation and Declination
          </h2>
          <FormBadge
            status={
              reviewPending
                ? "Correction Required"
                : isPending
                ? "Approved"
                : formInfo?.status.fluVaccine ?? "Not Filled"
            }
          >
            {reviewPending
              ? "Correction Required"
              : isPending
              ? "Approved"
              : formInfo?.status.fluVaccine}
          </FormBadge>
        </div>
        <div className="flex gap-5 items-center">
          <Dialog>
            <DialogTrigger
              disabled={formInfo?.status.fluVaccine === "Not Filled"}
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
                  disabled={formInfo?.status.fluVaccine === "Not Filled"}
                  className="flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#c82d2d] disabled:cursor-not-allowed disabled:bg-[#e159598a] disabled:hover:bg-[#e159598a] text-white w-fit h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]"
                >
                  <Image
                    src="/assets/images/dashboard/reviewIcon.svg"
                    width={20}
                    height={20}
                    alt="info icon"
                  />
                  {formInfo?.status?.fluVaccine === "Correction Required"
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
                formInfo?.status.fluVaccine === "Not Filled" ||
                formInfo?.status.fluVaccine === "Approved" ||
                hasApproved
              }
              onClick={() => mutate(name)}
              className={`flex items-center justify-center disabled:cursor-not-allowed gap-2 disabled:bg-[#6287d77e] ${
                formInfo?.status.fluVaccine === "Not Filled" ||
                formInfo?.status.fluVaccine === "Approved" ||
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
              {formInfo?.status.fluVaccine === "Approved" || hasApproved
                ? "Approved"
                : "Approve"}
            </button>
          )}
        </div>
      </div>

      {formInfo?.status?.fluVaccine === "Correction Required" && (
        <FormBanner
          variant="warning"
          text={
            formInfo?.forms?.fluVaccine?.data?.fluFullForm?.review_notes ?? ""
          }
        />
      )}

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-5 h-fit py-10 p-5 rounded-[12px]">
        <h2 className="text-[18px] font-[600] text-[#0F172A]">
          Employee Information
        </h2>

        <div className="xl:w-full flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.fluVaccine.data.fluEmployeeInformation
                  .last_name ?? "-"}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.fluVaccine.data.fluEmployeeInformation
                  .first_name ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-5 h-fit py-10 p-5 rounded-[12px]">
        <h2 className="text-[18px] font-[600] text-[#0F172A]">
          Vaccine Information
        </h2>

        <div className="xl:w-full flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-3">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Please select one of the following options
              </h2>
              <ul className="text-[14px] font-[400] text-[#0F172A] list-disc ml-5">
                {formInfo?.forms.fluVaccine.data.fluAttestationForm &&
                  Object.keys(
                    formInfo?.forms.fluVaccine.data.fluAttestationForm
                  ).length > 0 &&
                  formInfo?.forms.fluVaccine.data.fluAttestationForm
                    .have_received_flu_vaccine && (
                    <li>
                      Vaccination Attestation: I have received the flu vaccine
                      as recommended
                    </li>
                  )}

                {formInfo?.forms.fluVaccine.data.fluAttestationForm &&
                  Object.keys(
                    formInfo?.forms.fluVaccine.data.fluAttestationForm
                  ).length > 0 &&
                  formInfo?.forms.fluVaccine.data.fluAttestationForm
                    .have_received_flu_vaccine === false && (
                    <li>
                      <p>
                        Vaccination Declination:I decline to receive the flu
                        vaccine for the current flu season for the following
                        reason(s)
                      </p>
                      <p>
                        {formInfo?.forms.fluVaccine.data.fluAttestationForm
                          .have_received_flu_vaccine &&
                          "I have already received the flu vaccine elsewhere"}
                      </p>
                      <p>
                        {formInfo?.forms.fluVaccine.data.fluAttestationForm
                          .have_received_flu_vaccine &&
                          "I have medical contraindications to receiving the flu vaccine"}
                      </p>
                      <p>
                        {formInfo?.forms.fluVaccine.data.fluAttestationForm
                          .have_received_flu_vaccine &&
                          "I have personal or religious beliefs that prevent me from receiving the flu vaccine"}
                      </p>
                      <p>
                        {formInfo?.forms.fluVaccine.data.fluAttestationForm
                          .have_received_flu_vaccine &&
                          "I am allergic to components of the flu vaccine"}
                      </p>
                      <p>
                        {formInfo?.forms.fluVaccine.data.fluAttestationForm
                          .have_received_flu_vaccine &&
                          "I have concerns about the safety or efficacy of the flu disease"}
                      </p>
                      <p>
                        {formInfo?.forms.fluVaccine.data.fluAttestationForm
                          .other &&
                        formInfo?.forms.fluVaccine.data.fluAttestationForm.other
                          .length > 1
                          ? formInfo?.forms.fluVaccine.data.fluAttestationForm
                              .other
                          : "-"}
                      </p>
                    </li>
                  )}

                {formInfo?.forms.fluVaccine.data.fluAttestationForm &&
                  Object.keys(
                    formInfo?.forms.fluVaccine.data.fluAttestationForm
                  ).length < 1 && <li>-</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FluVaccineReview;
