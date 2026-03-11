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
import { formatDate } from "@/utils";

const EmployeeDemographicReview = ({
  name,
  formInfo,
  id,
}: {
  name: string;
  formInfo: UserFormInfo | undefined;
  id: string;
}) => {
  const { mutate, isPending, hasApproved, formID } = useApproveForm(
    "demographic",
    name,
    "Employee Demographic Form"
  );

  const {
    mutate: mutateReview,
    isPending: reviewPending,
    reviewNote,
    handleChange,
  } = useSendReview("demographic", name, formID!);

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
            name: "Employee Demographic Form",
            route: `/admin?name=${name}&id=${id}&form=employeeDemographic&formId=${formID}`,
          },
        ]}
      />

      <div className="flex justify-between gap-5 flex-wrap">
        <div className="flex flex-wrap gap-5 items-center">
          <h2 className="text-[#101828] text-[30px] font-[600]">
            Employee Demographic Form
          </h2>
          <FormBadge
            status={
              reviewPending
                ? "Correction Required"
                : isPending
                ? "Approved"
                : formInfo?.status.employeeDemographic ?? "Not Filled"
            }
          >
            {reviewPending
              ? "Correction Required"
              : isPending
              ? "Approved"
              : formInfo?.status.employeeDemographic}
          </FormBadge>
        </div>
        <div className="flex gap-5 items-center">
          <Dialog>
            <DialogTrigger
              disabled={formInfo?.status.employeeDemographic === "Not Filled"}
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
                    formInfo?.status.employeeDemographic === "Not Filled"
                  }
                  className="flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#c82d2d] disabled:cursor-not-allowed disabled:bg-[#e159598a] disabled:hover:bg-[#e159598a] text-white w-fit h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]"
                >
                  <Image
                    src="/assets/images/dashboard/reviewIcon.svg"
                    width={20}
                    height={20}
                    alt="info icon"
                  />
                  {formInfo?.status?.employeeDemographic ===
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
            <button
              disabled
              className="bg-[#6287d77e] w-[160px] h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500 text-white"
            >
              <Loader height="h-fit" />
            </button>
          )}

          {!isPending && (
            <button
              disabled={
                formInfo?.status.employeeDemographic === "Not Filled" ||
                formInfo?.status.employeeDemographic === "Approved" ||
                hasApproved
              }
              onClick={() => mutate(name)}
              className={`flex items-center justify-center disabled:cursor-not-allowed gap-2 disabled:bg-[#6287d77e] ${
                formInfo?.status.employeeDemographic === "Not Filled" ||
                formInfo?.status.employeeDemographic === "Approved" ||
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
              {formInfo?.status.employeeDemographic === "Approved" ||
              hasApproved
                ? "Approved"
                : "Approve"}
            </button>
          )}
        </div>
      </div>

      {formInfo?.status?.employeeDemographic === "Correction Required" && (
        <FormBanner
          variant="warning"
          text={
            formInfo?.forms?.employeeDemographic?.data
              ?.employeeDemographicInformation?.review_notes ?? ""
          }
        />
      )}

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 h-fit py-10 p-5 rounded-[12px]">
        <h2 className="text-[18px] font-[600] text-[#0F172A]">
          Personal Information
        </h2>

        <div className="w-full flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.employeeDemographic.data
                  .employeeDemographicInformation.last_name ?? "-"}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Social Security Number
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.employeeDemographic.data
                  .employeeDemographicInformation.social_security_number ?? "-"}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Cell Phone Number
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.employeeDemographic.data
                  .employeeDemographicInformation.phone ?? "-"}
              </p>
            </div>
          </div>

          <div className="w-full xl:w-[50%] flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.employeeDemographic.data
                  .employeeDemographicInformation.first_name ?? "-"}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Date of Birth
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.employeeDemographic.data
                  .employeeDemographicInformation.date_of_birth
                  ? formatDate(
                      new Date(
                        formInfo?.forms.employeeDemographic.data.employeeDemographicInformation.date_of_birth
                      )
                    )
                  : "-"}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Home Phone Number
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.employeeDemographic.data
                  .employeeDemographicInformation.home_phone_number ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">
            Street Address
          </h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {formInfo?.forms.employeeDemographic.data
              .employeeDemographicInformation.street_address ?? "-"}
          </p>
        </div>

        <div className="w-full flex flex-col gap-5 xl:w-full lg:justify-self-center lg:grid lg:grid-cols-2 xl:grid-cols-3">
          <div className="w-full flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">City</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {formInfo?.forms.employeeDemographic.data
                .employeeDemographicInformation.city ?? "-"}
            </p>
          </div>

          <div className="w-full flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">State</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {formInfo?.forms.employeeDemographic.data
                .employeeDemographicInformation.state ?? "-"}
            </p>
          </div>

          <div className="w-full flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">Zip Code</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {formInfo?.forms.employeeDemographic.data
                .employeeDemographicInformation.zip_code ?? "-"}
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">
            Race And Ethnicity
          </h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {formInfo?.forms.employeeDemographic.data
              .employeeDemographicInformation.race_or_ethinicity ?? "-"}
          </p>
        </div>

        <div className="w-full flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">Gender</h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {formInfo?.forms.employeeDemographic.data
              .employeeDemographicInformation.gender ?? "-"}
          </p>
        </div>
      </div>

      <div className="w-full flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-[5vh] h-fit py-10 p-5 rounded-[12px]">
        <h2 className="text-[18px] font-[600] text-[#0F172A]">
          Emergency Contact Information
        </h2>

        <div className="w-full  flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.employeeDemographic.data
                  .emergencyContactInformation.first_name ?? "-"}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Phone Number
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.employeeDemographic.data
                  .emergencyContactInformation.phone ?? "-"}
              </p>
            </div>
          </div>

          <div className="w-full xl:w-[50%] flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.employeeDemographic.data
                  .emergencyContactInformation.last_name ?? "-"}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Relationship To Employee
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms.employeeDemographic.data
                  .emergencyContactInformation.relationship_to_employee ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">
            Street Address
          </h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {formInfo?.forms.employeeDemographic.data
              .emergencyContactInformation.street_address ?? "-"}
          </p>
        </div>

        <div className="w-full flex flex-col gap-5 xl:w-full lg:justify-self-center lg:grid lg:grid-cols-2 xl:grid-cols-3">
          <div className="w-full flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">City</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {formInfo?.forms.employeeDemographic.data
                .emergencyContactInformation.city ?? "-"}
            </p>
          </div>

          <div className="w-full flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">State</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {formInfo?.forms.employeeDemographic.data
                .emergencyContactInformation.state ?? "-"}
            </p>
          </div>

          <div className="w-full flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">Zip Code</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {formInfo?.forms.employeeDemographic.data
                .emergencyContactInformation.zip_code ?? "-"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmployeeDemographicReview;
