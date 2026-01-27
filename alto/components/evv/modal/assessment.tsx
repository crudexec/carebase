import { UnscheduledVisit } from "@prisma/client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  Button,
  DateInput,
  Form,
  FormField,
  FormRender,
  Modal,
  RadioInput,
} from "@/components/ui";
import { usePopulateForm, useSaveUnscheduledVisitDetails } from "@/hooks";

const AssessmentModal = ({
  action,
  setAction,
  patientId,
  data,
  mutate,
}: {
  patientId: string;
  data?: UnscheduledVisit;
  action: string;
  setAction: (action: string) => void;
  mutate: () => void;
}) => {
  const methods = useForm({
    defaultValues: {
      dateAssessmentCompleted: new Date(),
      assessment: "",
    },
    mode: "onChange",
    shouldUnregister: false,
  });
  const {
    data: response,
    isMutating,
    trigger,
  } = useSaveUnscheduledVisitDetails();

  usePopulateForm<unknown, UnscheduledVisit>(methods.reset, data);

  const onClose = () => {
    setAction("");
    methods.reset();
  };

  useEffect(() => {
    if (response?.success) {
      mutate();
      onClose();
      toast.success(`Success|${response?.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <Modal
      title={"Assessment Completed Date"}
      open={action === "assessment"}
      onClose={onClose}
      className="md:max-w-[600px]"
    >
      <Form {...methods}>
        <form
          className="flex flex-col gap-5 scrollbar-hide px-1"
          onSubmit={methods.handleSubmit(async (formData) => {
            await trigger({
              patientId,
              id: data?.id,
              dateAssessmentCompleted: formData.dateAssessmentCompleted,
              assessment: formData.assessment,
            });
          })}
        >
          <FormField
            control={methods.control}
            name={"dateAssessmentCompleted"}
            render={({ field }) => (
              <FormRender label={"(M0090) Date Assessment Completed"}>
                <DateInput {...field} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"assessment"}
            render={({ field }) => (
              <FormRender label="Assessment Type">
                <RadioInput
                  {...field}
                  className="grid md:grid-cols-2 gap-3 items-center mt-4"
                  options={[
                    { value: "oasis", label: "OASIS" },
                    { value: "non-oasis", label: "Non-OASIS" },
                    {
                      value: "pediatric-assessment",
                      label: "Pediatric Assessment",
                    },
                    {
                      value: "non-skilled-assessment",
                      label: "Non-Skilled Assessment",
                    },
                  ]}
                />
              </FormRender>
            )}
          />

          <div className="flex justify-end text-end my-2">
            <Button loading={isMutating}>Save Changes</Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};

export default AssessmentModal;
