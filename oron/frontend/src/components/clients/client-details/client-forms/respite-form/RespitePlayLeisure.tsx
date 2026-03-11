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
import { submitRespitePlayLeisure } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

const leisureSchema = z.object({
  activities: z.array(z.string()).min(1, "Please select at least one activity"),
  other: z.string().optional(),
});

type LeisureFormData = z.infer<typeof leisureSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  respiteForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const activitiesMap = {
  puzzle: "Puzzle",
  dance: "Dance",
  arts_and_crafts: "Arts & crafts",
  listen_to_music: "Listen to music",
  icons_or_pictures: "Icons/pictures",
  computer_games: "Computer games",
  short_naps: "Short naps",
};

const activitiesOptions = [
  { label: "Puzzle", value: "puzzle" },
  { label: "Dance", value: "dance" },
  { label: "Arts & crafts", value: "arts_and_crafts" },
  { label: "Listen to music", value: "listen_to_music" },
  { label: "Icons/pictures", value: "icons_or_pictures" },
  { label: "Computer games", value: "computer_games" },
  { label: "Short naps", value: "short_naps" },
];

const RespitePlayLeisure = ({
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
  } = useForm<LeisureFormData>({
    resolver: zodResolver(leisureSchema),
    defaultValues: {
      activities: [],
      other: "",
    },
  });

  useEffect(() => {
    if (!respiteForm?.playLeisure) return;

    setMethod("PATCH");
    const { playLeisure } = respiteForm;

    // Populate form with existing data
    const selectedActivities = [];
    if (playLeisure.puzzle) selectedActivities.push("puzzle");
    if (playLeisure.dance) selectedActivities.push("dance");
    if (playLeisure.arts_and_crafts) selectedActivities.push("arts_and_crafts");
    if (playLeisure.listen_to_music) selectedActivities.push("listen_to_music");
    if (playLeisure.icons_or_pictures)
      selectedActivities.push("icons_or_pictures");
    if (playLeisure.computer_games) selectedActivities.push("computer_games");
    if (playLeisure.short_naps) selectedActivities.push("short_naps");
    if (playLeisure.other) selectedActivities.push("other");

    if (selectedActivities.length > 0) {
      setValue("activities", selectedActivities);
    }

    if (playLeisure.other) {
      setSelectOther(true);
      setValue("other", playLeisure.other_specify || "");
    }
  }, [respiteForm, setValue]);

  const onSubmit = async (data: LeisureFormData) => {
    try {
      const token = localStorage.getItem("token") as string;
      if (!respiteForm?.id) return;

      const transformedData = {
        puzzle: data.activities.includes("puzzle"),
        dance: data.activities.includes("dance"),
        arts_and_crafts: data.activities.includes("arts_and_crafts"),
        listen_to_music: data.activities.includes("listen_to_music"),
        icons_or_pictures: data.activities.includes("icons_or_pictures"),
        computer_games: data.activities.includes("computer_games"),
        short_naps: data.activities.includes("short_naps"),
        other: data.activities.includes("other"),
        other_specify: data.other,
      };

      const response = await submitRespitePlayLeisure(
        token,
        transformedData,
        respiteForm.id,
        method,
        respiteForm?.playLeisure?.id
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
      console.error("ERROR SUBMITTING PLAY/LEISURE", err);
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
        puzzle: data.activities.includes("puzzle"),
        dance: data.activities.includes("dance"),
        arts_and_crafts: data.activities.includes("arts_and_crafts"),
        listen_to_music: data.activities.includes("listen_to_music"),
        icons_or_pictures: data.activities.includes("icons_or_pictures"),
        computer_games: data.activities.includes("computer_games"),
        short_naps: data.activities.includes("short_naps"),
        other: data.activities.includes("other"),
        other_specify: data.other,
      };

      const response = await submitRespitePlayLeisure(
        token,
        transformedData,
        respiteForm.id,
        method,
        respiteForm?.playLeisure?.id
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
    const currentValues = getValues("activities") || [];
    if (currentValues.includes(value)) {
      setValue(
        "activities",
        currentValues.filter((item: string) => item !== value)
      );
    } else {
      setValue("activities", [...currentValues, value]);
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
      <h3 className="text-[#0F172A] text-[24px] font-[600]">Play/ Leisure</h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            For short breaks, {username} engaged in the following play/leisure
            activities
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {activitiesOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <Controller
                  name="activities"
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

          {errors.activities && (
            <p className="text-red-500 text-sm">{errors.activities.message}</p>
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

export default RespitePlayLeisure;
