"use client";

import FormBadge from "@/components/badge/FormBadge";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/Loader";
import useApproveForm from "@/hooks/admin/useApproveForm";
import { UserFormInfo } from "@/types/AdminTypes";
import useSendReview from "@/hooks/admin/useSendReview";
import FormBanner from "@/components/banner/FormBanner";
import BreadCrumb from "@/components/BreadCrumb";

const BiodataReview = ({
  name,
  formInfo,
  id,
}: {
  name: string;
  formInfo: UserFormInfo | undefined;
  id: string;
}) => {
  const { mutate, isPending, hasApproved, formID } = useApproveForm(
    "biodata",
    name,
    "Bio Data Form"
  );
  const {
    mutate: mutateReview,
    isPending: reviewPending,
    reviewNote,
    handleChange,
  } = useSendReview("biodata", name, formID!);

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
            name: "Bio Data Form",
            route: `/admin?name=${name}&id=${id}&form=biodata&formId=${formID}`,
          },
        ]}
      />

      <div className="flex justify-between gap-5 flex-wrap">
        <div className="flex flex-wrap gap-5 items-center">
          <h2 className="text-[#101828] text-[30px] font-[600]">
            Bio-Data Form
          </h2>
          <FormBadge
            status={
              reviewPending
                ? "Correction Required"
                : isPending
                ? "Approved"
                : formInfo?.status.biodata ?? "Not Filled"
            }
          >
            {reviewPending
              ? "Correction Required"
              : isPending
              ? "Approved"
              : formInfo?.status.biodata}
          </FormBadge>
        </div>
        <div className="flex gap-5 items-center">
          <Dialog>
            <DialogTrigger disabled={formInfo?.status.biodata === "Not Filled"}>
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
                  disabled={formInfo?.status.biodata === "Not Filled"}
                  className="flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#c82d2d] disabled:cursor-not-allowed disabled:bg-[#e159598a] disabled:hover:bg-[#e159598a] text-white w-fit h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]"
                >
                  <Image
                    src="/assets/images/dashboard/reviewIcon.svg"
                    width={20}
                    height={20}
                    alt="info icon"
                  />
                  {formInfo?.status?.biodata === "Correction Required"
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
                formInfo?.status.biodata === "Not Filled" ||
                formInfo?.status.biodata === "Approved" ||
                hasApproved
              }
              onClick={() => mutate(name)}
              className={`flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-[#6287d77e] ${
                formInfo?.status.biodata === "Not Filled" ||
                formInfo?.status.biodata === "Approved" ||
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
              {formInfo?.status.biodata === "Approved" || hasApproved
                ? "Approved"
                : "Approve"}
            </button>
          )}
        </div>
      </div>

      {formInfo?.status?.biodata === "Correction Required" && (
        <FormBanner
          variant="warning"
          text={formInfo?.forms?.biodata?.data?.review_notes ?? ""}
        />
      )}

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-5 h-fit py-10 p-5 rounded-[12px]">
        <h2 className="text-[18px] font-[600] text-[#0F172A]">Bio-Data Form</h2>

        <div className="w-full  flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms?.biodata?.data?.last_name ?? "-"}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Middle Initial (If any)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms?.biodata?.data?.middle_name ?? "-"}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Email Address
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms?.biodata?.data?.email ?? "-"}
              </p>
            </div>
          </div>

          <div className="w-full flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms?.biodata?.data?.first_name ?? "-"}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Other last names used (if any)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms?.biodata?.data?.other_last_name ?? "-"}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Phone Number
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms?.biodata?.data?.phone ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">Address</h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {formInfo?.forms?.biodata?.data?.address ?? "-"}
          </p>
        </div>

        <div className="w-full flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Apartment Number (If any)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms?.biodata?.data?.apartment_number ?? "-"}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">State</h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms?.biodata?.data?.state ?? "-"}
              </p>
            </div>
          </div>

          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                City Or Town
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms?.biodata?.data?.city ?? "-"}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Zip Code
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {formInfo?.forms?.biodata?.data?.zip_code ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">
            US Social Security number
          </h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {formInfo?.forms?.biodata?.data?.social_security_number ?? "-"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default BiodataReview;
