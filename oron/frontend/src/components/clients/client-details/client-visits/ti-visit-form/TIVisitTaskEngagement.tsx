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
import { submitTiVisitTaskEngagement } from "@/actions/clients/respite/respiteForm";

const taskEngagementSchema = z.object({
  tasks: z.array(z.string()).min(1, "Please select at least one task"),
  other_description: z.string().optional(),
});

type TaskEngagementFormData = z.infer<typeof taskEngagementSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  tiForm: any; // TODO: Replace with proper type once implemented
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const taskOptions = [
  { label: "Arrange chairs", value: "arrange_chairs" },
  { label: "Remove trash", value: "remove_trash" },
  { label: "Arrange tables", value: "arrange_tables" },
  { label: "Turn off light", value: "turn_off_light" },
  { label: "Turn off computer", value: "turn_off_computer" },
  { label: "Dust furniture", value: "dust_furniture" },
  { label: "Arrange bookshelves", value: "arrange_bookshelves" },
  { label: "Vacuum", value: "vacuum" },
  { label: "Other", value: "other" },
];

const TIVisitTaskEngagement = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  tiForm,
  isViewing,
  isEditing,
  username = "Client",
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<TaskEngagementFormData>({
    resolver: zodResolver(taskEngagementSchema),
    defaultValues: {
      tasks: [],
      other_description: "",
    },
  });

  useEffect(() => {
    // if (!tiForm?.taskEngagement) return;
    // setMethod("PATCH");
    // const { taskEngagement } = tiForm;
    // // Populate form with existing data
    // const selectedTasks = [];
    // if (taskEngagement.arrange_chairs) selectedTasks.push("arrange_chairs");
    // if (taskEngagement.remove_trash) selectedTasks.push("remove_trash");
    // if (taskEngagement.arrange_tables) selectedTasks.push("arrange_tables");
    // if (taskEngagement.turn_off_light) selectedTasks.push("turn_off_light");
    // if (taskEngagement.turn_off_computer)
    //   selectedTasks.push("turn_off_computer");
    // if (taskEngagement.dust_furniture) selectedTasks.push("dust_furniture");
    // if (taskEngagement.arrange_bookshelves)
    //   selectedTasks.push("arrange_bookshelves");
    // if (taskEngagement.vacuum) selectedTasks.push("vacuum");
    // if (taskEngagement.other) selectedTasks.push("other");
    // setValue("tasks", selectedTasks);
    // setValue("other_description", taskEngagement.other_description || "");
  }, [tiForm, setValue]);

  const onSubmit = async (data: TaskEngagementFormData) => {
    try {
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        arrange_chairs: data.tasks.includes("arrange_chairs"),
        remove_trash: data.tasks.includes("remove_trash"),
        arrange_tables: data.tasks.includes("arrange_tables"),
        turn_off_light: data.tasks.includes("turn_off_light"),
        turn_off_computer: data.tasks.includes("turn_off_computer"),
        dust_furniture: data.tasks.includes("dust_furniture"),
        arrange_bookshelves: data.tasks.includes("arrange_bookshelves"),
        vacuum: data.tasks.includes("vacuum"),
        other: data.tasks.includes("other"),
        other_description: data.other_description,
      };

      // const response = await submitTiVisitTaskEngagement(
      //   token,
      //   transformedData,
      //   tiForm.id,
      //   method,
      //   tiForm?.taskEngagement?.id
      // );

      // if (!response.status) {
      //   toast({
      //     variant: "destructive",
      //     description: response.errorMessage,
      //   });
      //   return;
      // }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (err) {
      console.error("ERROR SUBMITTING TASK ENGAGEMENT", err);
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

      // const transformedData = {
      //   arrange_chairs: data.tasks.includes("arrange_chairs"),
      //   remove_trash: data.tasks.includes("remove_trash"),
      //   arrange_tables: data.tasks.includes("arrange_tables"),
      //   turn_off_light: data.tasks.includes("turn_off_light"),
      //   turn_off_computer: data.tasks.includes("turn_off_computer"),
      //   dust_furniture: data.tasks.includes("dust_furniture"),
      //   arrange_bookshelves: data.tasks.includes("arrange_bookshelves"),
      //   vacuum: data.tasks.includes("vacuum"),
      //   other: data.tasks.includes("other"),
      //   other_description: data.other_description,
      // };

      // const response = await submitTiVisitTaskEngagement(
      //   token,
      //   transformedData,
      //   tiForm.id,
      //   method,
      //   tiForm?.taskEngagement?.id
      // );

      // if (!response.status) {
      //   toast({
      //     variant: "destructive",
      //     description: response.errorMessage,
      //   });
      //   return;
      // }

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
    const currentTasks = getValues("tasks") || [];
    if (currentTasks.includes(value)) {
      setValue(
        "tasks",
        currentTasks.filter((item: string) => item !== value)
      );
    } else {
      setValue("tasks", [...currentTasks, value]);
    }
  };

  const watchTasks = watch("tasks");
  const showOtherInput = watchTasks.includes("other");

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
      <h3 className="text-[#0F172A] text-[24px] font-[600]">Task Engagement</h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I assisted {username} with the following tasks at the TI center
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {taskOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <Controller
                  name="tasks"
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
          </div>

          {showOtherInput && (
            <Controller
              name="other_description"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText="Please specify other tasks"
                  placeholder="Enter other tasks"
                  type="text"
                  isAuth={false}
                  isError={!!errors.other_description}
                  disabled={isFormDisabled}
                  errorMessage={errors.other_description?.message}
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

export default TIVisitTaskEngagement;
