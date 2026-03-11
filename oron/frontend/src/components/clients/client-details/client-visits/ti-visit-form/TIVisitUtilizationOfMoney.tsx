"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FormInput from "@/components/input-fields/FormInput";
import { toast } from "@/components/ui/use-toast";
import { submitRespiteUtilizationOfMoney } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

const moneyUtilizationSchema = z.object({
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
  activityLocation: z.string().min(1, "Please specify the location"),
});

type MoneyUtilizationFormData = z.infer<typeof moneyUtilizationSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  tiForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
  handleChangeStep: (newStep: number) => void;
}

const skillsOptions = [
  "Handing bills to cashier",
  "Handing coins to cashier",
  "Handing debit/credit card to cashier",
  "Using the dollar-up program",
  "Waiting for and accepting the change",
  "Waiting for and receiving the debit/credit card",
  "Counting the change to make sure it was correct",
  "Determining and handling the correct estimated amount",
  "Obtaining and reviewing receipt for accuracy",
  "None",
];

const TIVisitUtilizationOfMoney = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  tiForm,
  isViewing,
  isEditing,
  username = "Client",
  handleChangeStep,
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<MoneyUtilizationFormData>({
    resolver: zodResolver(moneyUtilizationSchema),
    defaultValues: {
      skills: [],
      activityLocation: "",
    },
  });

  useEffect(() => {
    if (!tiForm?.utilizationOfMoney) return;

    setMethod("PATCH");
    const { utilizationOfMoney } = tiForm;

    // Populate skills
    const selectedSkills = [];
    if (utilizationOfMoney.handing_bills_to_cashier)
      selectedSkills.push("Handing bills to cashier");
    if (utilizationOfMoney.handing_coins_to_cashier)
      selectedSkills.push("Handing coins to cashier");
    if (utilizationOfMoney.handing_debit_credit_card_to_cashier)
      selectedSkills.push("Handing debit/credit card to cashier");
    if (utilizationOfMoney.using_the_dollar_up_program)
      selectedSkills.push("Using the dollar-up program");
    if (utilizationOfMoney.waiting_for_and_accepting_the_change)
      selectedSkills.push("Waiting for and accepting the change");
    if (utilizationOfMoney.waiting_for_and_receiving_debit_credit_card)
      selectedSkills.push("Waiting for and receiving the debit/credit card");
    if (utilizationOfMoney.counting_the_change_to_make_sure_it_is_correct)
      selectedSkills.push("Counting the change to make sure it was correct");
    if (
      utilizationOfMoney.determining_and_handling_the_correct_estimated_amount
    )
      selectedSkills.push(
        "Determining and handling the correct estimated amount"
      );
    if (utilizationOfMoney.obtaining_and_reviewing_receipt_for_accuracy)
      selectedSkills.push("Obtaining and reviewing receipt for accuracy");

    setValue("skills", selectedSkills);
    setValue(
      "activityLocation",
      utilizationOfMoney.this_activity_occured_at || ""
    );
  }, [tiForm, setValue]);

  const onSubmit = async (data: MoneyUtilizationFormData) => {
    try {
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        handing_bills_to_cashier: data.skills.includes(
          "Handing bills to cashier"
        ),
        handing_coins_to_cashier: data.skills.includes(
          "Handing coins to cashier"
        ),
        handing_debit_credit_card_to_cashier: data.skills.includes(
          "Handing debit/credit card to cashier"
        ),
        using_the_dollar_up_program: data.skills.includes(
          "Using the dollar-up program"
        ),
        waiting_for_and_accepting_the_change: data.skills.includes(
          "Waiting for and accepting the change"
        ),
        waiting_for_and_receiving_debit_credit_card: data.skills.includes(
          "Waiting for and receiving the debit/credit card"
        ),
        counting_the_change_to_make_sure_it_is_correct: data.skills.includes(
          "Counting the change to make sure it was correct"
        ),
        determining_and_handling_the_correct_estimated_amount:
          data.skills.includes(
            "Determining and handling the correct estimated amount"
          ),
        obtaining_and_reviewing_receipt_for_accuracy: data.skills.includes(
          "Obtaining and reviewing receipt for accuracy"
        ),
        none: data.skills.includes("None"),
        this_activity_occured_at: data.activityLocation,
      };

      const response = await submitRespiteUtilizationOfMoney(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.utilizationOfMoney?.id
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleChangeStep(3);
    } catch (err) {
      console.error("ERROR SUBMITTING MONEY UTILIZATION", err);
      toast({
        variant: "destructive",
        description: "Failed to submit form",
      });
    }
  };

  const handleDraftSubmit = async () => {
    try {
      setIsSubmittingDraft(true);
      const data = getValues();
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        handing_bills_to_cashier: data.skills.includes(
          "Handing bills to cashier"
        ),
        handing_coins_to_cashier: data.skills.includes(
          "Handing coins to cashier"
        ),
        handing_debit_credit_card_to_cashier: data.skills.includes(
          "Handing debit/credit card to cashier"
        ),
        using_the_dollar_up_program: data.skills.includes(
          "Using the dollar-up program"
        ),
        waiting_for_and_accepting_the_change: data.skills.includes(
          "Waiting for and accepting the change"
        ),
        waiting_for_and_receiving_debit_credit_card: data.skills.includes(
          "Waiting for and receiving the debit/credit card"
        ),
        counting_the_change_to_make_sure_it_is_correct: data.skills.includes(
          "Counting the change to make sure it was correct"
        ),
        determining_and_handling_the_correct_estimated_amount:
          data.skills.includes(
            "Determining and handling the correct estimated amount"
          ),
        obtaining_and_reviewing_receipt_for_accuracy: data.skills.includes(
          "Obtaining and reviewing receipt for accuracy"
        ),
        none: data.skills.includes("None"),
        this_activity_occured_at: data.activityLocation,
      };

      const response = await submitRespiteUtilizationOfMoney(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.utilizationOfMoney?.id
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      toast({
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("ERROR SAVING DRAFT", err);
      toast({
        variant: "destructive",
        description: "Failed to save draft",
      });
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  const handleCheckboxChange = (skill: string) => {
    const selectedSkills = getValues("skills");

    if (skill === "None") {
      if (selectedSkills.includes("None")) {
        setValue("skills", []);
      } else {
        setValue("skills", ["None"]);
      }
    } else {
      const filteredSkills = selectedSkills.filter((item) => item !== "None");
      if (selectedSkills.includes(skill)) {
        setValue(
          "skills",
          filteredSkills.filter((item) => item !== skill)
        );
      } else {
        setValue("skills", [...filteredSkills, skill]);
      }
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);

  const showLocationInput =
    watch("skills").length > 0 && !watch("skills").includes("None");

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Utilization Of Money
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} practice the following utilization of money
            skill(s):
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {skillsOptions.map((skill) => (
              <div key={skill} className="flex items-center gap-2">
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={skill}
                      checked={field.value.includes(skill)}
                      onCheckedChange={() => handleCheckboxChange(skill)}
                      disabled={isFormDisabled}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={skill}
                >
                  {skill}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {showLocationInput && (
          <div className="flex flex-col gap-5">
            <h4 className="text-[#0F172A] text-[18px] font-[600]">
              This activity occurred at:
            </h4>

            <Controller
              name="activityLocation"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText=""
                  placeholder="Enter location here..."
                  type="text"
                  isAuth={false}
                  disabled={isFormDisabled}
                  isError={!!errors.activityLocation}
                  errorMessage={errors.activityLocation?.message}
                />
              )}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              type="button"
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button onClick={() => handleChangeIndex(currentIndex + 1)}>
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default TIVisitUtilizationOfMoney;
