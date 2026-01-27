"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import PromptModal from "@/components/prompt-modal";
import {
  Button,
  Form,
  FormField,
  FormRender,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  sectionFDefaultValue,
  SectionFForm,
  sectionFSchema,
} from "@/schema/assessment/soc-assess/section-f";
import { ObjectData } from "@/types";

const SectionF = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionFForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionFForm>({
    resolver: zodResolver(sectionFSchema),
    defaultValues: sectionFDefaultValue,
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
        onSubmit={methods.handleSubmit(async (formData) => {
          trigger({
            socAccess: parseData({ ...assessment, sectionF: formData }),
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
              <FormHeader className="mt-4">
                LIVING SITUATION / CARE MANAGEMENT
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"livingSituation"}
                  render={({ field }) => (
                    <FormRender label="(M1100) Patient Living Situation: Which of the following best describes the patient's residential circumstances and availability of assistance?">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "alone-around-the-clock",
                            label:
                              "Patient lives alone. Availability of assistance is around the clock",
                          },
                          {
                            value: "alone-regular-daytime",
                            label:
                              "Patient lives alone. Availability of assistance is regular daytime",
                          },
                          {
                            value: "alone-regular-nighttime",
                            label:
                              "Patient lives alone. Availability of assistance is regular nighttime",
                          },
                          {
                            value: "alone-occasional",
                            label:
                              "Patient lives alone. Availability of assistance is occasional/short term assistance",
                          },
                          {
                            value: "alone-no-assistance",
                            label:
                              "Patient lives alone. Availability of assistance is no assistance available",
                          },
                          {
                            value: "with-person-around-the-clock",
                            label:
                              "Patient with other person(s) in the home. Availability of assistance is around the clock",
                          },
                          {
                            value: "with-person-regular-daytime",
                            label:
                              "Patient with other person(s) in the home. Availability of assistance is regular daytime",
                          },
                          {
                            value: "with-person-regular-nighttime",
                            label:
                              "Patient with other person(s) in the home. Availability of assistance is regular nighttime",
                          },
                          {
                            value: "with-person-occasional",
                            label:
                              "Patient with other person(s) in the home. Availability of assistance is occasional/short term assistance",
                          },
                          {
                            value: "with-person-no-assistance",
                            label:
                              "Patient with other person(s) in the home. Availability of assistance is no assistance available",
                          },
                          {
                            value: "in-congregate-around-the-clock",
                            label:
                              "Patient in congregate situation (e.g.,assisted living). Availability of assistance is around the clock",
                          },
                          {
                            value: "in-congregate-regular-daytime",
                            label:
                              "Patient in congregate situation (e.g.,assisted living). Availability of assistance is regular daytime",
                          },
                          {
                            value: "in-congregate-regular-nighttime",
                            label:
                              "Patient in congregate situation (e.g.,assisted living). Availability of assistance is regular nighttime",
                          },
                          {
                            value: "in-congregate-occasional",
                            label:
                              "Patient in congregate situation (e.g.,assisted living). Availability of assistance is occasional/short term assistance",
                          },
                          {
                            value: "in-congregate-no-assistance",
                            label:
                              "Patient in congregate situation (e.g.,assisted living). Availability of assistance is no assistance available",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">CARE MANAGEMENT</FormHeader>
              <div>
                <p className="text-sm font-semibold pb-2">
                  (M2102) Types and sources of Assistance: Determine the ability
                  and willingness of non-agency caregivers (such as family
                  members, friends, or privately paid caregivers) to provide
                  assistance for the following activities, if assistance is
                  needed. Excludes all care by your agency staff
                </p>
                <FormField
                  control={methods.control}
                  name={"careManagement"}
                  render={({ field }) => (
                    <FormRender label="Type of Assistance (f). Supervision and Safety (for example: due to cognitive impairment)">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "no-assistance-needed",
                            label:
                              " No assistance needed - patient is independent or does not have needs in this area",
                          },
                          {
                            value: "caregiver-provides-asssitancer",
                            label:
                              "Non-agency caregiver(s) currently provide assistance",
                          },
                          {
                            value: "caregiver-needs-to-provide-asssitance",
                            label:
                              " Non-agency caregiver(s) need training/supportive services to provide assistance",
                          },
                          {
                            value: "caregiver-unlikely-to-provide-asssitance",
                            label:
                              "Non-agency caregiver(s) are not likely to provide assistance OR it is unclear if they will provide assistance",
                          },
                          {
                            value: "assistance-needed",
                            label:
                              "Assistance needed, but no non-agency caregiver(s) available",
                          },
                        ]}
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

export default SectionF;
