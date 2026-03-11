"use client";

import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import Loader from "../Loader";
import FormSelect from "../input-fields/FormSelect";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { SetStateAction, useState, useEffect } from "react";
import {
  JobPosition,
  POSITION_OVERVIEWS,
  POSITION_RESPONSIBILITIES,
} from "./contants";
import { useToast } from "../ui/use-toast";
import { OfferLetterResponse } from "@/types/OfferLetterTypes";
import { generateDynamicPDF } from "@/utils/pdf/pdf-generator";
import { formatDate } from "@/utils";
import { handleDocumentUpload } from "@/actions/upload";
import { sendOfferLetter } from "@/actions/admin/offer-letter";
import { CheckIcon } from "lucide-react";

interface Props {
  showModal: boolean;
  setShowModal: (value: SetStateAction<boolean>) => void;
  offerLetterLoading: boolean;
  employeeName: string;
  offerLetter: OfferLetterResponse | undefined;
  employeeId: string;
}

export const formatResponsibilities = (
  responsibilities: string[],
  jobPosition: JobPosition | undefined
) => {
  const index = responsibilities.findIndex((item) =>
    item.startsWith("Additionally")
  );
  if (
    index !== -1 &&
    (jobPosition === "Family Consultant" ||
      jobPosition === "Intensive Individual Support Services(IISS)")
  ) {
    const beforeAdditionally = responsibilities
      .slice(0, index)
      .map((item, idx) => `${idx + 1}. ${item}`)
      .join("\n");
    const additionallyParagraph = responsibilities[index];
    const afterAdditionally = responsibilities
      .slice(index + 1)
      .map((item, idx) => `${index + 1 + idx}. ${item}`)
      .join("\n");
    return `${beforeAdditionally}\n\n${additionallyParagraph}\n\n${afterAdditionally}`;
  } else {
    return responsibilities
      .map((item, idx) => `${idx + 1}. ${item}`)
      .join("\n");
  }
};

export const createDSPOfferLetter = (jobPosition: JobPosition | undefined,
  employeeName: string) => {
   
  return `
Job Offer for DSP (Direct Care Worker) Position

Position: DSP (Direct Care Worker)

Company: Creed Medical Group

Location: 9658 Baltimore Avenue, Suite 300, College Park MD 20740

Date: ${formatDate(new Date())}

Dear ${employeeName},

We are pleased to offer you the position of DSP (Direct Care Worker) at Creed Medical Group. As a newly established company, we are excited
to bring on board a dedicated and experienced professional like you to oversee and establish our various support programs.

Position Overview

The Direct Care Worker plays a vital role in providing essential support and assistance to individuals in need of direct care services. This position requires compassionate individuals who are dedicated to improving the quality of life for vulnerable populations. As a Direct Care Worker in the state of Maryland, you will be responsible for providing care, support, and supervision to individuals in various settings, ensuring their safety, well-being, and overall comfort.

Responsibilities:

1. Personal Care Assistance: Provide assistance with activities of daily living (ADLs), including bathing, grooming, dressing, toileting, and mobility assistance, based on the individual's needs and abilities.
2. Medication Administration: Administer medications following established protocols, ensuring accurate dosage and proper documentation as per state regulations and agency policies.
3. Monitoring and Documentation: Observe and document the individual's physical and emotional well-being, behavior, and any changes in condition. Maintain accurate records and reports as required.
4. Safety and Supervision: Ensure the safety and security of individuals by maintaining a safe environment, monitoring for hazards, and promptly addressing any safety concerns.
5. Emotional Support: Provide emotional support and companionship to individuals, promoting their social and emotional well-being through active listening, empathy, and engaging in meaningful conversations.
6. Assistance with Meals: Prepare or assist individuals with meal planning, preparation, and feeding according to their dietary needs, preferences, and any prescribed restrictions.
7. Transportation: Accompany and assist individuals during appointments, recreational activities, or community outings, ensuring their safe transportation and adherence to scheduled activities.
8. Household Support: Perform light housekeeping tasks, such as cleaning, laundry, and organizing, to maintain a clean and comfortable living environment for individuals.
9. Communication and Collaboration: Maintain effective communication with individuals, their families, and interdisciplinary team members to ensure coordinated care and address any concerns or changes in care plans.
10. Adherence to Regulations: Follow all relevant state and federal regulations, as well as agency policies and procedures, regarding the provision of direct care services.

NOTE: Please note that in the event you decide to resign from this position, we kindly request that you provide a written two-week notice prior to your last working day. This notice period allows for a smooth transition and sufficient time for us to make necessary arrangements for the continuity of responsibilities. Failure to give us two weeks' notice before quitting risks forfeiture of pay.

We believe your expertise and passion will be a valuable asset to Creed Medical Group, and we look forward to the contributions you will make to our team. This is an excellent opportunity to shape the future of our programs and make a significant impact on the lives of those we serve.

Non-Compete:
The Employee acknowledges that they may gain access to confidential information through Creed Medical Group. To protect the Company’s interests, the Employee agrees not to provide services to Creed Medical Group clients, work for competitors within a 50-mile radius, or solicit clients or employees for one (1) year after their first interaction with the Company. The Employee also agrees to maintain confidentiality. Any breach may lead to legal action, including damages. This Agreement is governed by the laws of the State of Maryland. By signing this offer letter, the Employee confirms understanding and acceptance of these terms.

Condition of Employment:
As a condition of employment and in line with Maryland state regulations, all Direct Support Professionals (DSPs) must complete and submit accurate service notes for each shift worked. These notes serve as the official record of services provided and are essential for verification, billing, and compliance. Documentation must be entered when the service is rendered and no later than the end of each workweek. Notes not submitted on time will result in non-payment for those shifts, as undocumented services are considered not provided. Late or missing notes for any pay period will lead to forfeiture of payment for the corresponding work completed.
Failure to adhere to documentation requirements may also impact continued employment. All new hires are subject to a 120-day probationary period, during which performance, compliance with documentation standards, and overall conduct will be evaluated. Employees are expected to follow all documentation deadlines and quality standards as outlined in company policy and state guidelines.

Client Assignment Disclaimer:
Employment with Creed Medical Group Inc. depends on client choice and compatibility. Clients may request staff changes at any time. If a client ends services or the agency finds a mismatch, your assignment may end immediately. Creed Medical Group Inc. will try to reassign you if possible, but hours are not guaranteed. By accepting this offer, you agree that these situations do not count as termination by the agency and make you ineligible to file for unemployment in Maryland. All new employees are subject to a 120-day probationary period.
If you have any questions or need further information, please do not hesitate to contact us. We look forward to your acceptance and the beginning of a productive and rewarding journey together.

Christian Sigwe,                                        
CEO
Creed Medical Group
`;
}

export const createOfferLetterTemplate = (
  jobPosition: JobPosition | undefined,
  employeeName: string,
  jobPositionMessage: string,
  jobResponsibilities: string[]
) => {

  if (jobPosition === 'DSP (Direct Care Worker)') {
    return createDSPOfferLetter(jobPosition, employeeName);
  }

  return `
Job Offer for ${jobPosition} Position

Position: ${jobPosition}

Company: Creed Medical Group

Location: 9658 Baltimore Avenue, Suite 300, College Park MD 20740 
  
Date: ${formatDate(new Date())}

Dear ${employeeName},

We are pleased to offer you the position of ${jobPosition} at Creed Medical Group. As a newly established company, we are excited 
to bring on board a dedicated and experienced professional like you to oversee and establish our various support programs.

Position Overview

${jobPositionMessage}

Responsibilities:

${formatResponsibilities(jobResponsibilities, jobPosition)}

NOTE: Please note that in the event you decide to resign from this position, we kindly request that you provide a written two-week notice prior to your last working day. This notice period allows for a smooth transition and sufficient time for us to make necessary arrangements for the continuity of responsibilities. Failure to give us two weeks' notice before quitting risks forfeiture of pay.

We believe your expertise and passion will be a valuable asset to Creed Medical Group, and we look forward to the contributions you will make to our team. This is an excellent opportunity to shape the future of our programs and make a significant impact on the lives of those we serve.

Non-Compete:
The Employee acknowledges that they may gain access to confidential information through Creed Medical Group. To protect the Company’s interests, the Employee agrees not to provide services to Creed Medical Group clients, work for competitors within a 50-mile radius, or solicit clients or employees for one (1) year after their first interaction with the Company. The Employee also agrees to maintain confidentiality. Any breach may lead to legal action, including damages. This Agreement is governed by the laws of the State of Maryland. By signing this offer letter, the Employee confirms understanding and acceptance of these terms.

If you have any questions or need further information, please do not hesitate to contact us. We look forward to your acceptance and the beginning of a productive and rewarding journey together.

Christian Sigwe,                                        
CEO
Creed Medical Group
`;
};

const CreateOfferLetter = ({
  showModal,
  setShowModal,
  offerLetterLoading,
  employeeName,
  offerLetter,
  employeeId,
}: Props) => {
  const { toast } = useToast();

  const [jobPosition, setJobPosition] = useState<JobPosition>();
  const [jobPositionMessage, setJobPositionMessage] = useState("");
  const [jobResponsibilities, setJobResponsibilities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOfferLetter, setShowOfferLetter] = useState(false);
  const [editOfferLetter, setEditOfferLetter] = useState(false);

  const initialOfferLetter = createOfferLetterTemplate(
    jobPosition,
    employeeName,
    jobPositionMessage,
    jobResponsibilities
  );

  const [value, setValue] = useState<any>(initialOfferLetter);

  useEffect(() => {
    setValue(initialOfferLetter);
  }, [
    jobPositionMessage,
    initialOfferLetter,
    jobPosition,
    jobResponsibilities,
  ]);

  useEffect(() => {
    setJobPositionMessage(POSITION_OVERVIEWS[jobPosition!] || "");
    setJobResponsibilities(POSITION_RESPONSIBILITIES[jobPosition!] || []);
  }, [jobPosition]);

  return (
    <div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        {offerLetterLoading && (
          <DialogContent
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[12px] flex flex-col gap-5"
          >
            <Loader height="h-fit" />
          </DialogContent>
        )}

        {!offerLetterLoading && (
          <DialogContent
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[12px] flex flex-col gap-5"
          >
            <div className="w-full flex gap-5 justify-center items-center ml-auto">
              <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
                Send Offer Letter - {employeeName}
              </h2>
            </div>

            <FormSelect
              value={jobPosition}
              onValueChange={(e) => setJobPosition(e as JobPosition)}
              name="employeeRole"
              labelText="Select Employee's Role"
              placeholder="Select"
              selectContent={[
                {
                  label: "DSP (Direct Care Worker)",
                  value: "DSP (Direct Care Worker)",
                },
                {
                  label: "On-Call Professional",
                  value: "On-Call Professional",
                },
                {
                  label: "Family Consultant",
                  value: "Family Consultant",
                },
                {
                  label: "Intensive Individual Support Services(IISS)",
                  value: "Intensive Individual Support Services(IISS)",
                },
              ]}
            />

            <div className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
                className="w-full h-fit bg-[#F1F5F9] rounded-[6px] px-5 py-3 text-black disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 text-center justify-center"
              >
                Cancel
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();

                  if (
                    !jobPosition ||
                    typeof jobPosition !== "string" ||
                    (typeof jobPosition === "string" && jobPosition.length < 1)
                  ) {
                    return toast({
                      variant: "destructive",
                      description: "Please select Employee Role",
                    });
                  }

                  setShowModal(false);
                  setShowOfferLetter(true);
                }}
                className="w-full h-fit bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] px-5 py-3 text-white disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center text-center justify-center"
              >
                {offerLetter?.data?.offer_letter_pdf_url &&
                offerLetter?.data?.offer_letter_pdf_url?.length > 1
                  ? "Resend Offer Letter"
                  : "Send Offer Letter"}
              </button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={showOfferLetter} onOpenChange={setShowOfferLetter}>
        <DialogContent
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="w-full md:w-[90%] lg:w-[80%] max-w-full h-[90vh] overflow-auto"
        >
          <div className="w-full flex gap-5 h-fit ml-auto">
            <h2 className="text-[18px] w-full font-[600] text-[#101828] flex items-center gap-5">
              Preview and edit offer letter - {employeeName}
              {editOfferLetter ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditOfferLetter(false);
                  }}
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditOfferLetter(true);
                  }}
                >
                  <Image
                    src="/assets/images/dashboard/clientEdit.svg"
                    width={5}
                    height={5}
                    alt="edit icon"
                    className="w-5 h-5"
                  />
                </button>
              )}
            </h2>
          </div>

          <div className="w-full bg-[#F2F4F7] rounded-[6px] h-[70vh]">
            <Textarea
              name="preview"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-full bg-transparent"
              disabled={!editOfferLetter}
              // maxLength={30}
            />
          </div>

          <div className="w-full flex flex-col md:flex-row flex-wrap gap-5 justify-end mt-auto lg:pr-10 lg:py-3 lg:bg-white">
            <DialogClose
              onClick={(e) => {
                e.stopPropagation();
                setShowOfferLetter(false);
              }}
              className="w-[174px] h-fit bg-[#F1F5F9] rounded-[6px] px-5 py-3 text-black disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 justify-center"
            >
              Cancel
            </DialogClose>

            <button
              onClick={async (e) => {
                setIsLoading(true);
                e.stopPropagation();

                const token = localStorage.getItem("token") as string;

                const res = await generateDynamicPDF({
                  text: value,
                  employeeName,
                  date: formatDate(new Date()),
                });

                const formData = new FormData();
                formData.append("document", res);

                try {
                  const file_url = await handleDocumentUpload(formData, token);

                  const response = await sendOfferLetter(
                    token,
                    employeeId,
                    employeeName,
                    jobPosition!,
                    file_url
                  );

                  if (!response.status) {
                    setIsLoading(false);
                    return toast({
                      variant: "destructive",
                      description:
                        response.errorMessage ??
                        "A fatal error occurred while sending review!",
                    });
                  }

                  toast({
                    variant: "success",
                    description: `Offer Letter Successfully Sent To ${employeeName}`,
                  });
                  setIsLoading(false);

                  setShowOfferLetter(false);
                } catch (error: any) {
                  throw new Error(error);
                }
              }}
              disabled={isLoading}
              className="rounded-[6px] h-fit w-fit bg-[#2563EB] hover:bg-[#2b5dca] px-5 py-3 text-white ddisabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 justify-center"
            >
              {isLoading ? (
                <Loader height="h-fit" />
              ) : offerLetter?.data?.offer_letter_pdf_url &&
                offerLetter?.data?.offer_letter_pdf_url?.length > 1 ? (
                "Resend Offer Letter"
              ) : (
                "Send Offer Letter"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateOfferLetter;
