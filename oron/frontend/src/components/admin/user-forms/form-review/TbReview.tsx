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

const TbReview = ({
  name,
  formInfo,
  id,
}: {
  name: string;
  formInfo: UserFormInfo | undefined;
  id: string;
}) => {
  const { mutate, isPending, hasApproved, formID } = useApproveForm(
    "tb",
    name,
    "Tuberculosis Screening"
  );

  const {
    mutate: mutateReview,
    isPending: reviewPending,
    reviewNote,
    handleChange,
  } = useSendReview("tb", name, formID!);

  const renderResponse = (response: boolean | string | undefined) => {
    if (response === null || response === undefined) return "-";
    return response ? "Yes" : "No";
  };

  const renderDate = (date: string | undefined | null) => {
    return date ? formatDate(new Date(date)) : "-";
  };

  const renderSymptoms = (data: any) => {
    const symptoms = [
      data?.coughing_blood && "Coughing up blood",
      data?.profuse_night_sweats && "Profuse night sweats",
      data?.loss_of_appetite && "Loss of appetite",
      data?.unexplained_weight_loss && "Unexplained weight loss",
      data?.chill_or_fever && "Chills and/or fever",
      data?.persistent_cough_last_two_weeks &&
        "A persistent cough for longer than 2 weeks",
      data?.chest_pain &&
        "Recurring, dull, tightness or aching pain in the chest Coughing up blood",
    ];
    return symptoms.filter(Boolean).join(", ") || "-";
  };

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
            name: "Tuberculosis Screening",
            route: `/admin?name=${name}&id=${id}&form=tbForm&formId=${formID}`,
          },
        ]}
      />

      <div className="flex justify-between gap-5 flex-wrap">
        <div className="flex flex-wrap gap-5 items-center">
          <h2 className="text-[#101828] text-[30px] font-[600]">
            Tuberculosis Screening
          </h2>
          <FormBadge
            status={
              reviewPending
                ? "Correction Required"
                : isPending
                ? "Approved"
                : formInfo?.status.tbForm ?? "Not Filled"
            }
          >
            {reviewPending
              ? "Correction Required"
              : isPending
              ? "Approved"
              : formInfo?.status.tbForm}
          </FormBadge>
        </div>
        <div className="flex gap-5 items-center">
          <Dialog>
            <DialogTrigger disabled={formInfo?.status.tbForm === "Not Filled"}>
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
                  disabled={formInfo?.status.tbForm === "Not Filled"}
                  className="flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#c82d2d] disabled:cursor-not-allowed disabled:bg-[#e159598a] disabled:hover:bg-[#e159598a] text-white w-fit h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]"
                >
                  <Image
                    src="/assets/images/dashboard/reviewIcon.svg"
                    width={20}
                    height={20}
                    alt="info icon"
                  />
                  {formInfo?.status?.tbForm === "Correction Required"
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
                formInfo?.status.tbForm === "Not Filled" ||
                formInfo?.status.tbForm === "Approved" ||
                hasApproved
              }
              onClick={() => mutate(name)}
              className={`flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-[#6287d77e] ${
                formInfo?.status.tbForm === "Not Filled" ||
                formInfo?.status.tbForm === "Approved" ||
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
              {formInfo?.status.tbForm === "Approved" || hasApproved
                ? "Approved"
                : "Approve"}
            </button>
          )}
        </div>
      </div>

      {formInfo?.status?.tbForm === "Correction Required" && (
        <FormBanner
          variant="warning"
          text={
            formInfo?.forms?.tbForm?.data?.tuberculosisFullForm?.review_notes ??
            ""
          }
        />
      )}

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-5 h-fit py-10 p-5 rounded-[12px]">
        <h2 className="text-[18px] font-[600] text-[#0F172A]">
          Risk Assesment
        </h2>

        <div className="xl:w-full flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Have you ever had Tuberculosis?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  formInfo?.forms?.tbForm?.data.tuberculosisMantouxForm
                    .had_tb_infection
                )}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">When?</h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderDate(
                  formInfo?.forms?.tbForm.data.tuberculosisMantouxForm
                    .had_tb_infection_date
                )}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Have you ever had a positive reaction to a TB skin test?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  formInfo?.forms?.tbForm?.data.tuberculosisMantouxForm
                    .had_positive_tb_skin_test
                )}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">When?</h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderDate(
                  formInfo?.forms?.tbForm.data.tuberculosisMantouxForm
                    .had_positive_tb_skin_test_date
                )}
              </p>
            </div>
          </div>

          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Have you ever been immunized against TB with BCG or other serum?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  formInfo?.forms?.tbForm?.data.tuberculosisMantouxForm
                    .have_you_been_immunized_with_bcg_vaccine
                )}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Have you had any type of vaccine within the past TWO weeks?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  formInfo?.forms?.tbForm?.data.tuberculosisMantouxForm
                    .vaccine_past_two_weeks
                )}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Have you taken steriods of any kind during the last 4 weeks?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  formInfo?.forms?.tbForm?.data.tuberculosisMantouxForm
                    .steriod_injection_past_two_weeks
                )}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Have you had a known exposure to TB since your last TB test?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  formInfo?.forms?.tbForm?.data.tuberculosisMantouxForm
                    .exposure_to_tb_past_two_weeks
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Do you have any of the following symptoms?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderSymptoms(
                  formInfo?.forms.tbForm.data.tuberculosisMantouxForm
                )}
              </p>
            </div>
          </div>

          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                What date was your last chest X-Ray?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderDate(
                  formInfo?.forms?.tbForm.data.tuberculosisMantouxForm
                    .last_chest_xray_date
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TbReview;
