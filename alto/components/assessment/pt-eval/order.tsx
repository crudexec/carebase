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
import {
  orderDefaultValue,
  OrderForm,
  orderSchema,
} from "@/schema/assessment/pt-eval/order";
import { ObjectData } from "@/types";

const Order = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: OrderForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: orderDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "goalIntervention",
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
        onSubmit={methods.handleSubmit(async (data) => {
          trigger({
            ptEval: parseData({ ...assessment, order: data }),
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
            <div>
              <FormHeader className="mt-4">Orders</FormHeader>
              <div className="grid gap-5">
                <div className="grid lg:grid-cols-4 gap-5 text-sm font-semibold bg-secondary p-3">
                  <p>Therapy services</p>
                  <p>LOS(Length of session)</p>
                  <p>Frequency</p>
                  <p>Duration</p>
                </div>
                <p className="text-2xl font-semibold">Physical therapy:</p>
                <div className="grid lg:grid-cols-4 gap-5 items-center text-sm font-semibold">
                  <p>Restore patient function</p>
                  <FormField
                    control={methods.control}
                    name={"restorePatientLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"restorePatientFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"restorePatientDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-center text-sm font-semibold">
                  <p>Perform maintenance therapy</p>
                  <FormField
                    control={methods.control}
                    name={"performMaintenanceLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"performMaintenanceFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"performMaintenanceDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-center text-sm font-semibold">
                  <p>Therapeutic exercises</p>
                  <FormField
                    control={methods.control}
                    name={"therapeuticExerciseLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"therapeuticExerciseFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"therapeuticExerciseDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-center text-sm font-semibold">
                  <p>Gait and balance training</p>
                  <FormField
                    control={methods.control}
                    name={"balanceTrainingLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"balanceTrainingFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"balanceTrainingDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-center text-sm font-semibold">
                  <p>ADL training</p>
                  <FormField
                    control={methods.control}
                    name={"adlTrainingLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"adlTrainingFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"adlTrainingDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"otherPhysicalTherapy"}
                  render={({ field }) => (
                    <FormRender label="Other">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Goals & Interventions</FormHeader>
              <div className="grid gap-5">
                {fields.map((item, index) => (
                  <div key={item.id} className="border border-dashed p-2">
                    <div className="grid lg:grid-cols-2 gap-5">
                      <FormField
                        control={methods.control}
                        name={`goalIntervention.${index}.goalInterventionType`}
                        render={({ field }) => (
                          <FormRender label={`Type ${index + 1}:`}>
                            <SelectInput
                              options={[
                                { label: "goals", value: "Goals" },
                                {
                                  label: "interventions",
                                  value: "Interventions",
                                },
                              ]}
                              field={field}
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`goalIntervention.${index}.goalInterventionMsg`}
                        render={({ field }) => (
                          <FormRender label={`MSG ${index + 1}:`}>
                            <Textarea
                              {...field}
                              value={field.value as string}
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`goalIntervention.${index}.goalInterventionTerm`}
                        render={({ field }) => (
                          <FormRender label={`Term ${index + 1}:`}>
                            <SelectInput
                              options={[
                                { label: "short", value: "Short" },
                                { label: "long", value: "Long" },
                              ]}
                              field={field}
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`goalIntervention.${index}.targetDate`}
                        render={({ field }) => (
                          <FormRender label={`Target Date ${index + 1}:`}>
                            <DateInput {...field} value={field.value as Date} />
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
                            append(orderDefaultValue.goalIntervention[0])
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

export default Order;
