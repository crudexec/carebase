"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Flex from "@/components/flex";
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
  RadioInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  billingDefaultValue,
  BillingForm,
  billingSchema,
} from "@/schema/assessment/sn-visit/billing";
import { ObjectData } from "@/types";

const Billing = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: BillingForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA?: boolean;
}) => {
  const methods = useForm<BillingForm>({
    resolver: zodResolver(billingSchema),
    defaultValues: billingDefaultValue,
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
            snVisit: parseData({ ...assessment, billing: data }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
            visitDate: data?.visitDate,
            timeIn: data?.arrivalTime,
            timeOut: data?.departureTime,
          });
        })}
      >
        <div className="p-5">
          <div>
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
            <FormHeader className="mt-4">SERVICES</FormHeader>
            <div className="grid grid-col-1 lg:grid-cols-2 gap-5">
              <Flex className="gap-8" col>
                <FormField
                  control={methods.control}
                  name={"serviceProvided"}
                  render={({ field }) => (
                    <FormRender label="Service Provided">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "direct_care",
                            label: "Direct Care RN (wd, catheter, etc)",
                          },
                          {
                            value: "training_education",
                            label: "Training/Education RN (teaching)",
                          },
                          {
                            value: "observation_assessment",
                            label: "Observation/Assessment RN",
                          },
                          {
                            value: "m_and_e",
                            label:
                              "M&E by RN (if specific orders for mgmt/eval)",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"serviceProvided"}
                  render={({ field }) => (
                    <FormRender>
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "direct_care_lvn",
                            label: "Direct Care LVN (wd, catheter, etc)",
                          },
                          {
                            value: "training_education_lvn",
                            label: "Training/Education LVN (teaching)",
                          },
                          {
                            value: "observation_assessment_lvn",
                            label: "Observation/Assessment LVN",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
              </Flex>

              <FormField
                control={methods.control}
                name={"qCode"}
                render={({ field }) => (
                  <FormRender label="Q Code: (Location)">
                    <RadioInput
                      className="flex-row gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "1",
                          label:
                            "Hospice or home health care provided in patients home/residence",
                        },
                        {
                          value: "2",
                          label:
                            "Hospice or home health care provided in assisted living facility",
                        },
                        {
                          value: "3",
                          label:
                            "Hospice or home health care provided in place not otherwise specified (NO) (do not check this option claim will be rejected)",
                        },
                      ]}
                      id="qCode"
                    />
                  </FormRender>
                )}
              />
            </div>{" "}
            <FormHeader className="mt-4">VISIT</FormHeader>
            <div className="grid grid-col-1 lg:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"visitType"}
                render={({ field }) => (
                  <FormRender label="Visit Type">
                    <RadioInput
                      className="flex-row gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "direct_visit", label: "Direct visit" },
                        { value: "tele_visit", label: "Tele Visit" },
                        {
                          value: "video_conferencing",
                          label: "Video Conferencing",
                        },
                        { value: "missed_visit", label: "Missed Visit" },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"billableOptions"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "billable", label: "Billable" },
                        { value: "non_billable", label: "Non-Billable" },
                        { value: "prn", label: "PRN" },
                        { value: "sn", label: "SN" },
                        { value: "sn_sup", label: "SN & SUP" },
                        { value: "sup_only", label: "SUP Only" },
                      ]}
                      name={"billableOptions"}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"visitDate"}
                render={({ field }) => (
                  <FormRender formClassName="flex-1" label="Visit Date">
                    <DateInput
                      {...field}
                      value={field.value as Date}
                      className="flex-1"
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"milesTravelled"}
                render={({ field }) => (
                  <FormRender label="Miles Travelled">
                    <Input
                      {...field}
                      value={field.value as string}
                      placeholder="00:00"
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"nurseSignature"}
                render={({ field }) => (
                  <FormRender label="Nurse Signature">
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"arrivalTime"}
                render={({ field }) => (
                  <FormRender label={"Arrival Time:"}>
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
                name={"departureTime"}
                render={({ field }) => (
                  <FormRender label={"Depature Time:"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      type="time"
                    />
                  </FormRender>
                )}
              />
            </div>{" "}
            <FormHeader className="mt-4">
              TO BE USED FOR QA COMMENTS VIEW ONLY (NOT A PART OF THE NURSING
              NOTES)
            </FormHeader>
            <FormField
              control={methods.control}
              name={"qAComment"}
              render={({ field }) => (
                <FormRender label={"QA Comments:"}>
                  <Textarea
                    {...field}
                    value={field.value as string}
                    rows={10}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"qANurseResponse"}
              render={({ field }) => (
                <FormRender label={"QA Nurse Response:"} formClassName="mt-4">
                  <Textarea
                    {...field}
                    value={field.value as string}
                    rows={10}
                  />
                </FormRender>
              )}
            />
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

export default Billing;
