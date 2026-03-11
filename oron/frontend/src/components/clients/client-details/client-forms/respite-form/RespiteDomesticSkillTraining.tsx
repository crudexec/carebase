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
import { submitRespiteDomesticSkillTraining } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

const domesticSkillSchema = z.object({
  chores: z.array(z.string()).min(1, "Please select at least one option"),
  other: z.string().optional(),
});

type DomesticSkillFormData = z.infer<typeof domesticSkillSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  respiteForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const choresOptions = [
  { label: "Make bed", value: "make_bed" },
  { label: "Laundry", value: "laundry" },
  { label: "Dust furniture", value: "dust_furniture" },
  { label: "Do the dishes", value: "do_dishes" },
  { label: "Vacuum", value: "vacuum" },
  { label: "Remove trash", value: "remove_trash" },
  { label: "Arrange clothes", value: "arrange_clothes" },
  { label: "Fold clothes", value: "fold_clothes" },
];

const RespiteDomesticSkillTraining = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  respiteForm,
  isViewing,
  isEditing,
  username = "Client",
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const [selectOther, setSelectOther] = useState(false);
  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<DomesticSkillFormData>({
    resolver: zodResolver(domesticSkillSchema),
    defaultValues: {
      chores: [],
      other: "",
    },
  });

  useEffect(() => {
    if (!respiteForm?.domesticSkillTraining) return;

    setMethod("PATCH");
    const { domesticSkillTraining } = respiteForm;

    // Populate form with existing data
    const selectedChores = [];
    if (domesticSkillTraining.assist_to_make_bed)
      selectedChores.push("make_bed");
    if (domesticSkillTraining.assist_to_dust_furniture)
      selectedChores.push("dust_furniture");
    if (domesticSkillTraining.assist_to_vacuum) selectedChores.push("vacuum");
    if (domesticSkillTraining.assist_to_arrange_clothes)
      selectedChores.push("arrange_clothes");
    if (domesticSkillTraining.assist_to_laundry) selectedChores.push("laundry");
    if (domesticSkillTraining.assist_to_do_dishes)
      selectedChores.push("do_dishes");
    if (domesticSkillTraining.assist_to_remove_trash)
      selectedChores.push("remove_trash");
    if (domesticSkillTraining.assist_to_fold_clothes)
      selectedChores.push("fold_clothes");
    if (domesticSkillTraining.other) selectedChores.push("other");

    if (selectedChores.length > 0) {
      setValue("chores", selectedChores);
    }

    if (domesticSkillTraining.other) {
      setSelectOther(true);
      setValue("other", domesticSkillTraining.specify_other || "");
    }
  }, [respiteForm, setValue]);

  const onSubmit = async (data: DomesticSkillFormData) => {
    try {
      const token = localStorage.getItem("token") as string;
      if (!respiteForm?.id) return;

      const transformedData = {
        assist_to_make_bed: data.chores.includes("make_bed"),
        assist_to_dust_furniture: data.chores.includes("dust_furniture"),
        assist_to_vacuum: data.chores.includes("vacuum"),
        assist_to_arrange_clothes: data.chores.includes("arrange_clothes"),
        assist_to_laundry: data.chores.includes("laundry"),
        assist_to_do_dishes: data.chores.includes("do_dishes"),
        assist_to_remove_trash: data.chores.includes("remove_trash"),
        assist_to_fold_clothes: data.chores.includes("fold_clothes"),
        other: data.chores.includes("other"),
        specify_other: data.other,
      };

      const response = await submitRespiteDomesticSkillTraining(
        token,
        transformedData,
        respiteForm.id,
        method,
        respiteForm?.domesticSkillTraining?.id
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (err) {
      console.error("ERROR SUBMITTING DOMESTIC SKILL", err);
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
      if (!respiteForm?.id) return;

      const transformedData = {
        assist_to_make_bed: data.chores.includes("make_bed"),
        assist_to_dust_furniture: data.chores.includes("dust_furniture"),
        assist_to_vacuum: data.chores.includes("vacuum"),
        assist_to_arrange_clothes: data.chores.includes("arrange_clothes"),
        assist_to_laundry: data.chores.includes("laundry"),
        assist_to_do_dishes: data.chores.includes("do_dishes"),
        assist_to_remove_trash: data.chores.includes("remove_trash"),
        assist_to_fold_clothes: data.chores.includes("fold_clothes"),
        other: data.chores.includes("other"),
        specify_other: data.other,
      };

      const response = await submitRespiteDomesticSkillTraining(
        token,
        transformedData,
        respiteForm.id,
        method,
        respiteForm?.domesticSkillTraining?.id
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

  const handleCheckboxChange = (value: string) => {
    const currentValues = getValues("chores") || [];
    if (currentValues.includes(value)) {
      setValue(
        "chores",
        currentValues.filter((item: string) => item !== value)
      );
    } else {
      setValue("chores", [...currentValues, value]);
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

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Domestic Skill Training
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I assisted {username} with the following household chores:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {choresOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <Controller
                  name="chores"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={option.value}
                      checked={(field.value as string[]).includes(option.value)}
                      onCheckedChange={() => handleCheckboxChange(option.value)}
                      disabled={isFormDisabled}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={option.value}
                >
                  {option.label}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Checkbox
                id="other"
                checked={selectOther}
                onCheckedChange={(checked) => {
                  setSelectOther(checked === true);
                  if (!checked) {
                    setValue("other", "");
                  }
                }}
                disabled={isFormDisabled}
              />
              <Label
                className="text-[14px] font-[400] text-[#09090B]"
                htmlFor="other"
              >
                Other
              </Label>
            </div>
          </div>

          {errors.chores && (
            <p className="text-red-500 text-sm">{errors.chores.message}</p>
          )}

          {selectOther && (
            <Controller
              name="other"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText=""
                  placeholder="Please specify"
                  type="text"
                  isAuth={false}
                  isError={!!errors.other}
                  disabled={isFormDisabled}
                  errorMessage={errors.other?.message}
                />
              )}
            />
          )}
        </div>

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

export default RespiteDomesticSkillTraining;
