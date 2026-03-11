"use client";

import { TreatmentPlan } from "@/types/Events";
import { IntakeType } from "@/types/IntakeForm";
import { TreatmentPlanType } from "./TreatmentPlanWrapper";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import FormInput from "@/components/input-fields/FormInput";
import FormSelect from "@/components/input-fields/FormSelect";
import { TrashIcon } from "lucide-react";
import FormTextArea from "@/components/input-fields/FormTextArea";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: IntakeType | undefined;
  treatmentPlanData: TreatmentPlan | undefined;
  username: string;
  clientId: string;
  formType: TreatmentPlanType;
  formId: string;
  refetchTreatmentPlan: any;
}

const AdditionalInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  user,
  treatmentPlanData,
  username,
  clientId,
  formType,
  formId,
  refetchTreatmentPlan,
}: Props) => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isFormDisabled = mode === "view";

  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Additional Information
      </h3>

      <form className="flex flex-col gap-7">
        <div className="flex flex-col gap-5">
          <h3 className="text-[16px] font-[600] text-[#0F172A]">
            People in {username}&apos;s life
          </h3>

          <div className="flex  gap-5 items-center">
            <FormInput
              name="name"
              labelText={`Name (Person 1`}
              placeholder="Enter name"
              type="text"
              isAuth={false}
              disabled={isFormDisabled}
            />

            <FormSelect
              selectContent={[
                { label: "Family Member", value: "family_member" },
                { label: "Friend", value: "friend" },
                { label: "Community Member", value: "community_member" },
                { label: "Service Provider", value: "service_provider" },
              ]}
              labelText="Relation to participant"
              placeholder="Enter relation"
              disabled={isFormDisabled}
            />

            <button type="button" className="p-2 hover:bg-red-50 rounded-md">
              <TrashIcon className="w-5 h-5 text-black" />
            </button>
          </div>

          {!isFormDisabled && (
            <button
              type="button"
              className="w-fit text-[14px] font-[600] text-black hover:text-[#0F172A] bg-[#eff3f6] hover:bg-[#e2e6e9] rounded-md py-2 px-4 flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add person
            </button>
          )}
        </div>

        <FormTextArea
          name=""
          labelText={`Choices That ${username} Makes`}
          placeholder="Enter here.."
          disabled={isFormDisabled}
        />

        <FormTextArea
          name=""
          labelText={`Choices Made By Others`}
          placeholder="Enter here.."
          disabled={isFormDisabled}
        />

        <FormTextArea
          name=""
          labelText={`What Works For ${username}`}
          placeholder="Enter here.."
          disabled={isFormDisabled}
        />

        <FormTextArea
          name=""
          labelText={`What Does Not Work For ${username}`}
          placeholder="Enter here.."
          disabled={isFormDisabled}
        />

        <FormTextArea
          name=""
          labelText={`What Are ${username} Interests/Hobbies`}
          placeholder="Enter here.."
          disabled={isFormDisabled}
        />

        <FormTextArea
          name=""
          labelText={`What Makes ${username} Upset`}
          placeholder="Enter here.."
          disabled={isFormDisabled}
        />

        <FormTextArea
          name=""
          labelText={`What Are Some Of ${username} Favorite Things`}
          placeholder="Enter here.."
          disabled={isFormDisabled}
        />

        <FormTextArea
          name=""
          labelText={`What Makes ${username} Bored`}
          placeholder="Enter here.."
          disabled={isFormDisabled}
        />

        <FormTextArea
          name=""
          labelText={`Evaluating Progress`}
          placeholder="Enter here.."
          disabled={isFormDisabled}
        />

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            data-testid="previous-section-button"
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              type="button"
              isLoading={isSubmittingDraft}
              disabled={isSubmittingDraft}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              onClick={() => {
                handleChangeIndex(2);
              }}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button data-testid="next-section-button" type="submit">
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default AdditionalInformation;
