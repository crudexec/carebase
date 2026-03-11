"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
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
import { getErrorMessage, PersonalWorkOutput } from "@/utils/helpers";
import useVisitingFormSubmission from "../../logic";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { personalWorkSchema } from "../../logic/schema";
import { toast } from "@/components/ui/use-toast";

type PersonalWorkInput = {
  tasks: string[];
  other?: string;
  readABook: "yes" | "no";
};

const personalWorkMap: {
  [key: string]: keyof Omit<
    PersonalWorkOutput,
    "other" | "other_specify" | "read_a_book"
  >;
} = {
  Grammar: "grammar",
  Algebra: "algebra",
  "Writing Skills": "writing_skills",
  Geometry: "geometry",
  Vocabulary: "vocabulary",
  Measurement: "measurement",
  "Reading comprehension": "reading_comprehension",
  "Number operations": "number_operations",
};

function convertPersonalWork(input: PersonalWorkInput): PersonalWorkOutput {
  const output: PersonalWorkOutput = {
    grammar: false,
    algebra: false,
    writing_skills: false,
    geometry: false,
    vocabulary: false,
    measurement: false,
    reading_comprehension: false,
    number_operations: false,
    other: false,
    other_specify: input.other || null,
    i_read_a_book_to_client: input.readABook === "yes",
  };

  input.tasks.forEach((task) => {
    const key = personalWorkMap[task];
    if (key) {
      output[key] = true;
    } else if (task === "Other") {
      output.other = true;
    }
  });

  return output;
}

type PersonalWorkFormData = z.infer<typeof personalWorkSchema>;

interface PersonalWorkProps {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  admin?: boolean;
}

const tasksOptions = [
  "Grammar",
  "Algebra",
  "Writing Skills",
  "Geometry",
  "Vocabulary",
  "Measurement",
  "Reading comprehension",
  "Number operations",
  "None",
];

const populatePersonalWorkForm = (
  data: Partial<PersonalWorkOutput>,
  setValue: any
) => {
  const selectedTasks = Object.entries(personalWorkMap).reduce(
    (acc, [task, key]) => {
      if (data[key]) {
        acc.push(task);
      }
      return acc;
    },
    [] as string[]
  );

  setValue("tasks", selectedTasks);

  if (data.other && data.other_specify && data.other_specify?.length > 0) {
    setValue("other", data.other_specify || "");
  }

  if (selectedTasks.length === 0 && !data.other_specify) {
    setValue("tasks", ["None"]);
  }

  setValue(
    "readABook",
    data.i_read_a_book_to_client
      ? "yes"
      : data.i_read_a_book_to_client
      ? "no"
      : ""
  );
};

const PersonalWork: React.FC<PersonalWorkProps> = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  admin,
}) => {
  const [selectOther, setSelectOther] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<PersonalWorkFormData>({
    resolver: zodResolver(personalWorkSchema),
    defaultValues: {
      tasks: [],
      readABook: undefined,
    },
  });

  const { submitPersonalWork } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  const { state } = useVisitingFormContext();
  const { step_two_form, isFormDisabled: stateDis } = state;
  const isFormDisabled = stateDis;

  useEffect(() => {
    if (step_two_form && step_two_form.personalWork) {
      populatePersonalWorkForm(
        step_two_form.personalWork as Partial<PersonalWorkOutput>,
        setValue
      );

      if (
        (step_two_form.personalWork as Partial<PersonalWorkOutput>).other &&
        (step_two_form.personalWork as Partial<PersonalWorkOutput>)
          .other_specify &&
        (step_two_form.personalWork as Partial<PersonalWorkOutput>)
          ?.other_specify !== ""
      ) {
        setSelectOther(true);
      }
    }
  }, [step_two_form, setValue]);

  const onSubmit: SubmitHandler<PersonalWorkFormData> = async (data) => {
    setLoading(true);
    const convertedData = convertPersonalWork(data);
    await submitPersonalWork(convertedData);
    setLoading(false);
  };

  const saveDraft = async () => {
    setLoading(true);

    try {
      const data = getValues();
      const convertedData = convertPersonalWork(data);
      await submitPersonalWork(convertedData, true);
    } catch (error) {}

    setLoading(false);
  };

  const handleCheckboxChange = (task: string) => {
    const selectedTasks = getValues("tasks");

    if (task === "None") {
      if (selectedTasks.includes("None")) {
        setValue("tasks", []);
      } else {
        setValue("tasks", ["None"]);
      }
    } else {
      const c = selectedTasks.filter((item: string) => item !== "None");
      if (selectedTasks.includes(task)) {
        setValue(
          "tasks",
          c.filter((item: string) => item !== task)
        );
      } else {
        setValue("tasks", [...c, task]);
      }
    }
  };

  useEffect(() => {
    if (errors.tasks) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);
  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3
        data-testid="personal-work-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Personal Work / Reading
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I assisted {username} while engaged in the following task(s):
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4">
            {tasksOptions.map((task, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Controller
                  name="tasks"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={`task_${idx}`}
                      disabled={isFormDisabled}
                      checked={(field.value as string[]).includes(task)}
                      onCheckedChange={() => handleCheckboxChange(task)}
                      data-testid={`task-${task
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={`task_${idx}`}
                >
                  {task}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Checkbox
                id="other"
                checked={selectOther}
                disabled={isFormDisabled}
                onCheckedChange={(checked) => {
                  setSelectOther(checked === true);
                  if (checked) {
                    handleCheckboxChange("Other");
                  } else {
                    const selectedTasks = getValues("tasks")! as string[];
                    setValue(
                      "tasks",
                      selectedTasks.filter((item: string) => item !== "Other")
                    );
                  }
                }}
                data-testid={`task-other`}
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
            <p className="text-red-500 text-sm">
              {getErrorMessage(errors.tasks)}
            </p>
          )}
        </div>

        {selectOther && (
          <Controller
            name="other"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormInput
                {...field}
                labelText=""
                placeholder="Please specify"
                type="text"
                isAuth={false}
                isError={!!errors.other}
                errorMessage={getErrorMessage(errors.other)}
                data-testid="other-task"
              />
            )}
          />
        )}

        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I read a book to {username}
          </h4>

          <Controller
            name="readABook"
            control={control}
            // defaultValue="no"

            render={({ field }) => (
              <RadioGroup
                disabled={isFormDisabled}
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col gap-5"
                data-testid="read-book-radio"
              >
                <div>
                  <div className="flex items-center flex-wrap gap-5">
                    {["Yes", "No"].map((label) => (
                      <div key={label} className="flex items-center gap-2">
                        <RadioGroupItem
                          id={label}
                          value={label.toLowerCase()}
                          data-testid={`read-book-radio-item-${label.toLowerCase()}`}
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
                    <p className="text-red-600 text-sm mt-2">Required </p>
                  )}
                </div>
              </RadioGroup>
            )}
          />
        </div>

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%]">
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
              isLoading={loading}
              onClick={() => saveDraft()}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              isLoading={loading}
              onClick={() => {
                handleChangeIndex(currentIndex + 1);
              }}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              isLoading={loading}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default PersonalWork;
