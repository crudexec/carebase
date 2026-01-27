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
  RadioInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { cn, parseData } from "@/lib";
import {
  walkTestDefaultValue,
  WalkTestForm,
  walkTestSchema,
} from "@/schema/assessment/pt-eval/walk-test";
import { ObjectData } from "@/types";

const WalkTest = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  is3minWalkTest,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: WalkTestForm;
  mutate: () => void;
  patientScheduleId: string;
  is3minWalkTest?: boolean;
  assessment?: ObjectData;
  isQA?: boolean;
}) => {
  const methods = useForm<WalkTestForm>({
    resolver: zodResolver(walkTestSchema),
    defaultValues: walkTestDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "distance",
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
          if (is3minWalkTest) {
            trigger({
              walkTest: parseData(data),
              patientScheduleId,
              caregiverId: authUser?.id as string,
              id: assessmentId,
            });
          } else {
            trigger({
              ptEval: parseData({ ...assessment, walkTest: data }),
              patientScheduleId,
              caregiverId: authUser?.id as string,
              id: assessmentId,
            });
          }
        })}
      >
        <div className="p-5">
          <div className="flex justify-end text-end mt-2 gap-2">
            {!isQA ? (
              <>
                <Button className="px-6" loading={isMutating}>
                  Save Changes
                </Button>{" "}
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
                </Button>{" "}
                <Button
                  className="px-6"
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setAction("REJECTED");
                  }}
                >
                  Disapprove
                </Button>{" "}
              </>
            )}
          </div>
          <div>
            <div className="grid gap-5 border border-dashed p-2 mt-4">
              <div>
                <FormHeader className="mt-0">General Information:</FormHeader>
                <div>
                  <ul className="list-disc text-sm pl-5 font-semibold">
                    <li>
                      Individual Walks without assistance for 2 minutes and the
                      distance is measured
                      <ul className="list-inside list-disc">
                        <li>
                          Start timing when the individual is instructed to
                          "Go".
                        </li>
                        <li>Stop timing at 2 minutes</li>
                        <li>
                          Assistive devices can be used but should be kept
                          consistent and documented from test to test.
                        </li>
                        <li>
                          If physical assistance is required to walk,this should
                          not be performed.
                        </li>
                        <li>
                          A measuring wheel is helpful to determine distance
                          walked.
                        </li>
                      </ul>
                    </li>
                    <li>Should be performed at the fastest speed possible.</li>
                  </ul>
                </div>
              </div>
              <div>
                <FormHeader className="mt-4">Set-up and equipment:</FormHeader>
                <div>
                  <ul className="list-disc text-sm pl-5 font-semibold">
                    <li>Ensure the hallway free of obstacles.</li>
                    <li>Stopwatch</li>
                  </ul>
                </div>
              </div>
              <div>
                <FormHeader className="mt-4">
                  Patient Instructions(derived from references below):
                </FormHeader>
                <div>
                  <ul className="list-disc text-sm pl-5 font-semibold">
                    <li>
                      "Cover as much ground as possible over 2 minutes.Walk
                      continuously if possible,but do not be concerned if you
                      need to slow down or stop to rest. The goal is to feel at
                      the end of the test that more ground could not have been
                      covered in the 2 minutes."
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="grid gap-5 border border-dashed p-2 mt-4">
              <p>Walk Test</p>
              <FormField
                control={methods.control}
                name={"walkTestType"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "3-minutes", label: " 3 Minute Walk Test" },
                        { value: "6-minutes", label: "6 Minute Walk Test" },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"name"}
                  render={({ field }) => (
                    <FormRender label="Name:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"assistiveDevice"}
                  render={({ field }) => (
                    <FormRender label="Assistive Device and/or Bracing Used:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`assistiveDeviceDate`}
                  render={({ field }) => (
                    <FormRender label="Date:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
              </div>

              {fields.map((item, index) => (
                <div key={item.id} className="border border-dashed p-2">
                  <div className="grid lg:grid-cols-2 gap-5">
                    <FormField
                      control={methods.control}
                      name={`distance.${index}.distanceAmbulated`}
                      render={({ field }) => (
                        <FormRender label={`Distance ambulated in 2 minutes:`}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`distance.${index}.distanceAmbulatedDate`}
                      render={({ field }) => (
                        <FormRender label={`Date ${index + 1}:`}>
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
                        onClick={() => append(walkTestDefaultValue.distance[0])}
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
        <div className="flex justify-end text-end mt-2 pb-12 pr-5 gap-2">
          {!isQA ? (
            <>
              <Button className="px-6" loading={isMutating}>
                Save Changes
              </Button>{" "}
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
              </Button>{" "}
              <Button
                className="px-6"
                variant="destructive"
                type="button"
                onClick={() => {
                  setAction("REJECTED");
                }}
              >
                Disapprove
              </Button>{" "}
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default WalkTest;
