"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import { MinusIcon, PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import PromptModal from "@/components/prompt-modal";
import {
  Button,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { cn, parseData } from "@/lib";
import {
  timedUpDefaultValue,
  TimedUpForm,
  timedUpSchema,
} from "@/schema/assessment/pt-eval/timed-up";
import { ObjectData } from "@/types";

const TimedUp = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: TimedUpForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<TimedUpForm>({
    resolver: zodResolver(timedUpSchema),
    defaultValues: timedUpDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "tug",
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
            ptEval: parseData({ ...assessment, timedUp: data }),
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
          <div className="grid gap-5 mt-4">
            {fields.map((item, index) => (
              <div key={item.id} className="border border-dashed p-2">
                <div className="grid lg:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={`tug.${index}.tugTime`}
                    render={({ field }) => (
                      <FormRender label={`TUG Time ${index + 1}:`}>
                        <Input
                          {...field}
                          value={field.value as string}
                          type="time"
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`tug.${index}.tugDate`}
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
                      onClick={() => append(timedUpDefaultValue.tug[0])}
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

export default TimedUp;
