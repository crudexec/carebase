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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { submitRespitePersonalWorkReading } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

const personalWorkSchema = z.object({
  tasks: z.array(z.string()).min(1, "Please select at least one task"),
  other: z.string().optional(),
  readABook: z.enum(["yes", "no"], {
    required_error: "Please select whether you read a book",
  }),
});

type PersonalWorkFormData = z.infer<typeof personalWorkSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  respiteForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const tasksOptions = [
  { label: "Grammar", value: "grammar" },
  { label: "Writing Skills", value: "writing_skills" },
  { label: "Vocabulary", value: "vocabulary" },
  { label: "Reading comprehension", value: "reading_comprehension" },
  { label: "Algebra", value: "algebra" },
  { label: "Geometry", value: "geometry" },
  { label: "Measurement", value: "measurement" },
  { label: "Number operations", value: "number_operations" },
];

const RespitePersonalWorkReading = ({
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
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PersonalWorkFormData>({
    resolver: zodResolver(personalWorkSchema),
    defaultValues: {
      tasks: [],
      other: "",
      readABook: undefined,
    },
  });

  useEffect(() => {
    if (!respiteForm?.personalWorkReading) return;

    setMethod("PATCH");
    const { personalWorkReading } = respiteForm;

    // Populate form with existing data
    const selectedTasks = [];
    if (personalWorkReading.grammar) selectedTasks.push("grammar");
    if (personalWorkReading.writing_skills)
      selectedTasks.push("writing_skills");
    if (personalWorkReading.vocabulary) selectedTasks.push("vocabulary");
    if (personalWorkReading.reading_comprehension)
      selectedTasks.push("reading_comprehension");
    if (personalWorkReading.algebra) selectedTasks.push("algebra");
    if (personalWorkReading.geometry) selectedTasks.push("geometry");
    if (personalWorkReading.measurement) selectedTasks.push("measurement");
    if (personalWorkReading.number_operations)
      selectedTasks.push("number_operations");
    if (personalWorkReading.other) selectedTasks.push("other");

    if (selectedTasks.length > 0) {
      setValue("tasks", selectedTasks);
    }

    if (personalWorkReading.other) {
      setSelectOther(true);
      setValue("other", personalWorkReading.other_specify || "");
    }

    setValue(
      "readABook",
      personalWorkReading.i_read_a_book_to_client ? "yes" : "no"
    );
  }, [respiteForm, setValue]);

  const onSubmit = async (data: PersonalWorkFormData) => {
    try {
      const token = localStorage.getItem("token") as string;
      if (!respiteForm?.id) return;

      const transformedData = {
        grammar: data.tasks.includes("grammar"),
        writing_skills: data.tasks.includes("writing_skills"),
        vocabulary: data.tasks.includes("vocabulary"),
        reading_comprehension: data.tasks.includes("reading_comprehension"),
        algebra: data.tasks.includes("algebra"),
        geometry: data.tasks.includes("geometry"),
        measurement: data.tasks.includes("measurement"),
        number_operations: data.tasks.includes("number_operations"),
        other: data.tasks.includes("other"),
        other_specify: data.other,
        i_read_a_book_to_client: data.readABook === "yes",
      };

      const response = await submitRespitePersonalWorkReading(
        token,
        transformedData,
        respiteForm.id,
        method,
        respiteForm?.personalWorkReading?.id
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
      console.error("ERROR SUBMITTING PERSONAL WORK", err);
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
        grammar: data.tasks.includes("grammar"),
        writing_skills: data.tasks.includes("writing_skills"),
        vocabulary: data.tasks.includes("vocabulary"),
        reading_comprehension: data.tasks.includes("reading_comprehension"),
        algebra: data.tasks.includes("algebra"),
        geometry: data.tasks.includes("geometry"),
        measurement: data.tasks.includes("measurement"),
        number_operations: data.tasks.includes("number_operations"),
        other: data.tasks.includes("other"),
        other_specify: data.other,
        i_read_a_book_to_client: data.readABook === "yes",
      };

      const response = await submitRespitePersonalWorkReading(
        token,
        transformedData,
        respiteForm.id,
        method,
        respiteForm?.personalWorkReading?.id
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
    const currentValues = getValues("tasks") || [];
    if (currentValues.includes(value)) {
      setValue(
        "tasks",
        currentValues.filter((item: string) => item !== value)
      );
    } else {
      setValue("tasks", [...currentValues, value]);
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
        Personal Work / Reading
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I assisted {username} while engaged in the following task(s):
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4">
            {tasksOptions.map((option) => (
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

          {errors.tasks && (
            <p className="text-red-500 text-sm">{errors.tasks.message}</p>
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

        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I read a book to {username}
          </h4>

          <Controller
            name="readABook"
            control={control}
            render={({ field }) => (
              <RadioGroup
                disabled={isFormDisabled}
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col gap-5"
              >
                <div>
                  <div className="flex items-center flex-wrap gap-5">
                    {["Yes", "No"].map((label) => (
                      <div key={label} className="flex items-center gap-2">
                        <RadioGroupItem
                          id={label}
                          value={label.toLowerCase()}
                        />
                        <Label
                          className="text-[16px] font-[400] text-[#09090B]"
                          htmlFor={label}
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors?.readABook && (
                    <p className="text-red-600 text-sm mt-2">
                      {errors.readABook.message}
                    </p>
                  )}
                </div>
              </RadioGroup>
            )}
          />
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

export default RespitePersonalWorkReading;
