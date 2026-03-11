"use client";

import { useEffect, useState } from "react";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  TrashIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { toast } from "@/components/ui/use-toast";
import FormSelect from "@/components/input-fields/FormSelect";
import FormInput from "@/components/input-fields/FormInput";
import { z } from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  alpForm?: any; // Replace with proper type
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
  visitType: "first" | "second";
}

// Define the schema for a single attendee
const attendeeSchema = z.object({
  role: z.string().min(1, "Role is required"),
  firstName: z.string().min(1, "First name is required"),
});

// Define the schema for the entire form
const sessionAttendanceSchema = z.object({
  attendees: z
    .array(attendeeSchema)
    .min(1, "At least one attendee is required"),
});

// Infer the type from the schema
type SessionAttendanceFormValues = z.infer<typeof sessionAttendanceSchema>;

const AlpVisitSessionAttendance = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  alpForm,
  isViewing,
  isEditing,
  username = "Client",
  visitType,
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = isViewing;

  // Initialize the form with React Hook Form and Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SessionAttendanceFormValues>({
    resolver: zodResolver(sessionAttendanceSchema),
    defaultValues: {
      attendees: [{ role: "", firstName: "" }],
    },
  });

  // Use field array to manage dynamic attendees
  const { fields, append, remove } = useFieldArray({
    control,
    name: "attendees",
  });

  // Handle form submission
  const onSubmit = async (data: SessionAttendanceFormValues) => {
    try {
      const token = localStorage.getItem("token") as string;

      // Here you would typically send the data to your API
      // const response = await fetch('/api/session-attendance', {
      //   method: method,
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      // });

      // if (!response.ok) throw new Error('Failed to submit form');

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (err) {
      console.error("ERROR SUBMITTING SESSION ATTENDANCE", err);
      toast({
        variant: "destructive",
        description: "Failed to submit form",
      });
    }
  };

  const handleDraftSubmit = async () => {
    try {
      setIsSubmittingDraft(true);
      const token = localStorage.getItem("token") as string;

      // Here you would save the draft data
      // const formData = getValues();
      // const response = await fetch('/api/session-attendance/draft', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) throw new Error('Failed to save draft');

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

  // Load existing data if available
  useEffect(() => {
    if (alpForm?.sessionAttendance && !isFormDisabled) {
      reset({
        attendees: alpForm.sessionAttendance.attendees || [
          { role: "", firstName: "" },
        ],
      });
    }
  }, [alpForm, reset, isFormDisabled]);

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 static">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Session Attendance
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Controller
                name={`attendees.${index}.role`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    labelText={index === 0 ? "Role" : ""}
                    placeholder="Select role"
                    selectContent={[
                      { label: "Client", value: "client" },
                      { label: "Therapist", value: "therapist" },
                      { label: "Family Member", value: "family_member" },
                      { label: "Caregiver", value: "caregiver" },
                      { label: "Other", value: "other" },
                    ]}
                    {...field}
                    isError={!!errors.attendees?.[index]?.role}
                    errorMessage={errors.attendees?.[index]?.role?.message}
                    disabled={isFormDisabled}
                  />
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Controller
                  name={`attendees.${index}.firstName`}
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      labelText={
                        index === 0 ? `First Name (Person ${index + 1})` : ""
                      }
                      placeholder="Enter name"
                      {...field}
                      type="text"
                      isError={!!errors.attendees?.[index]?.firstName}
                      errorMessage={
                        errors.attendees?.[index]?.firstName?.message
                      }
                      disabled={isFormDisabled}
                    />
                  )}
                />
              </div>
              {!isFormDisabled && (
                <button
                  type="button"
                  className="mt-auto h-10 w-10 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length <= 1}
                  aria-label="Remove person"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {!isFormDisabled && (
          <button
            type="button"
            className="flex items-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors py-2 px-4 rounded-md w-fit"
            onClick={() => append({ role: "", firstName: "" })}
          >
            <PlusIcon className="w-5 h-5" /> Add person
          </button>
        )}

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
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
              data-testid="save-draft-button"
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              onClick={() => handleChangeIndex(currentIndex + 1)}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button type="submit" data-testid="next-section-button">
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default AlpVisitSessionAttendance;
