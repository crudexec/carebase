"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import { MinusIcon, PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import PromptModal from "@/components/prompt-modal";
import {
  Button,
  CheckboxGroup,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { cn, parseData } from "@/lib";
import { HistoryForm } from "@/schema/assessment/pt-visit/history";
import {
  sectionIDefaultValue,
  SectionIForm,
  sectionISchema,
} from "@/schema/assessment/soc-assess/section-i";
import { ObjectData } from "@/types";

const SectionI = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: HistoryForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionIForm>({
    resolver: zodResolver(sectionISchema),
    defaultValues: sectionIDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const [action, setAction] = useState<QAStatus>();
  const [qaComment, setQaComment] = useState("");

  usePopulateForm(methods.reset, data);

  useEffect(() => {
    if (response?.success) {
      toast.success("Details saved successfully!");
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "diagnosis",
  });

  const {
    trigger: updateQAStatus,
    isMutating: updating,
    data: updateresponse,
  } = useUpdateQAStatus();

  useEffect(() => {
    if (updateresponse?.success) {
      toast.success(updateresponse?.message);
      mutate();
      setAction(undefined);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateresponse]);

  const updateStatus = async (status: QAStatus) => {
    await updateQAStatus({
      status,
      id: assessmentId as string,
      qaComment,
    });
  };

  return (
    <Form {...methods}>
      <PromptModal
        title={action === "APPROVED" ? "Approve" : "Disapprove"}
        variant={action === "APPROVED" ? "default" : "destructive"}
        open={!!action}
        onClose={() => setAction(undefined)}
        callback={async () => {
          updateStatus(action as QAStatus);
        }}
        loading={updating}
      >
        <div className="mb-5">
          <p className="mb-4  font-semibold">QA Comment</p>
          <Textarea
            value={qaComment}
            onChange={(e) => setQaComment(e.target.value)}
            placeholder="Add QA comments"
            rows={5}
          />
        </div>
      </PromptModal>

      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          trigger({
            socAccess: parseData({ ...assessment, sectionI: formData }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
          });
        })}
      >
        <div className="p-5">
          <div className="flex justify-end text-end mt-2 gap-2">
            {!isQA ? (
              <>
                <Button className="px-6" loading={isMutating}>
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="px-6"
                  type="button"
                  onClick={() => {
                    setAction("APPROVED");
                  }}
                >
                  Approve
                </Button>
                <Button
                  className="px-6"
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setAction("REJECTED");
                  }}
                >
                  Disapprove
                </Button>
              </>
            )}
          </div>

          <div>
            <FormHeader className="mt-4">ACTIVE DIAGNOSIS</FormHeader>
            <div className="grid gap-5">
              {fields.map((item, index) => (
                <div key={item.id}>
                  <FormHeader className="text-sm mt-0">
                    {index === 0 ? "(M1021) Primary" : "(M1023) Other"}{" "}
                    Diagnosis {index + 1}
                  </FormHeader>
                  <div className="grid gap-5 grid-cols-2">
                    <FormField
                      control={methods.control}
                      name={`diagnosis.${index}.group`}
                      render={({ field }) => (
                        <FormRender label="Diagnosis Group:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`diagnosis.${index}.name`}
                      render={({ field }) => (
                        <FormRender label="Diagnosis:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`diagnosis.${index}.icdCode`}
                      render={({ field }) => (
                        <FormRender label="ICD Code:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`diagnosis.${index}.date`}
                      render={({ field }) => (
                        <FormRender label="Date">
                          <DateInput {...field} value={field.value as Date} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`diagnosis.${index}.status`}
                      render={({ field }) => (
                        <FormRender label="Status:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`diagnosis.${index}.controlRating`}
                      render={({ field }) => (
                        <FormRender label="Control Rating:">
                          <SelectInput
                            allowClear
                            options={[
                              { value: "0", label: "0" },
                              { value: "1", label: "1" },
                              { value: "2", label: "2" },
                              { value: "3", label: "3" },
                              { value: "4", label: "4" },
                            ]}
                            field={field}
                          />
                        </FormRender>
                      )}
                    />
                  </div>

                  <div className={cn("flex space-x-3 items-center mt-4")}>
                    {index === fields.length - 1 && (
                      <Button
                        variant="outline"
                        className="!font-medium !text-sm md:!text-base !leading-4 md:!leading-6 !py-3 !px-4 !rounded-[8px]"
                        type="button"
                        onClick={() =>
                          append(sectionIDefaultValue.diagnosis[0])
                        }
                      >
                        Add
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {fields.length > 1 && (
                      <Button
                        variant="destructive"
                        className="!font-medium !text-sm md:!text-base !leading-4 md:!leading-6 !py-3 !px-4 !rounded-[8px]"
                        type="button"
                        onClick={() => remove(index)}
                      >
                        <MinusIcon className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <div>
                <p className="text-sm font-semibold pb-2">
                  (M1028) Active Diagnoses- Comorbidities and Co-existing
                  Conditions-Check all that apply. See OASIS Guidance Manual for
                  a complete list of relevant ICD-10 codes. (If Not Applicable,
                  Please leave unchecked)
                </p>

                <FormField
                  control={methods.control}
                  name={"activeDiagnoses"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "peripheral-vascular-disease",
                            label:
                              "Peripheral Vascular Disease (PVD) or Peripheral Arterial Disease (PAD)",
                          },
                          {
                            value: "diabetes-mellitus",
                            label: "Diabetes Mellitus (DM)",
                          },
                          { value: "none", label: "None of the above" },
                        ]}
                        name={"activeDiagnoses"}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end text-end mt-2 pb-12 pr-5 gap-2">
          {!isQA ? (
            <>
              <Button className="px-6" loading={isMutating}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                className="px-6"
                type="button"
                onClick={() => {
                  setAction("APPROVED");
                }}
              >
                Approve
              </Button>
              <Button
                className="px-6"
                variant="destructive"
                type="button"
                onClick={() => {
                  setAction("REJECTED");
                }}
              >
                Disapprove
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default SectionI;
