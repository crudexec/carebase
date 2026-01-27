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
  Checkbox,
  CheckboxGroup,
  Form,
  FormField,
  FormRender,
  Input,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  sectionODefaultValue,
  SectionOForm,
  sectionOSchema,
} from "@/schema/assessment/soc-assess/section-o";
import { ObjectData } from "@/types";

const SectionO = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionOForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionOForm>({
    resolver: zodResolver(sectionOSchema),
    defaultValues: sectionODefaultValue,
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
            socAccess: parseData({ ...assessment, sectionO: formData }),
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
            <FormHeader className="mt-4">
              SPECIAL TREATMENT / PROCEEDURE / PROGRAMS (O0110)
            </FormHeader>
            <div className="grid gap-5">
              <div>
                <FormHeader className="mt-0 text-sm">
                  Cancer Treatments
                </FormHeader>
                <div className="grid gap-5">
                  <FormField
                    control={methods.control}
                    name={"isChemotherapy"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Chemotherapy</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`chemotherapyType`}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0 ml-5">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "IV", label: "IV" },
                            { value: "oral", label: "Oral" },
                            { value: "other", label: "Other" },
                          ]}
                          name={`chemotherapyType`}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isRadiation"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Radiation</span>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div>
                <FormHeader className="mt-0 text-sm">
                  Respiratory Therapies
                </FormHeader>
                <div className="grid gap-5">
                  <FormField
                    control={methods.control}
                    name={"isOxygenTherapy"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Oxygen Therapy</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`oxygenTherapyType`}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0 ml-5">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "continuous", label: "Continuous" },
                            { value: "intermittent", label: "Intermittent" },
                            {
                              value: "high-concentration",
                              label: "High-concentration",
                            },
                          ]}
                          name={`oxygenTherapyType`}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isSuctioning"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Suctioning</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`suctioningType`}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0 ml-5">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "scheduled", label: "Scheduled" },
                            { value: "as-needed", label: "As needed" },
                          ]}
                          name={`suctioningType`}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isTracheostomyCare"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Tracheostomy Care</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isInvasiveMechanicalVentilator"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Invasive Mechanical Ventilator (ventilator or
                            respirator)
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isNonInvasiveMechanicalVentilator"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            {" "}
                            Non-invasive Mechanical Ventilator
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`nonInvasiveMechanicalVentilatorType`}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0 ml-5">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "BiPAP", label: "BiPAP" },
                            { value: "CPAP", label: "CPAP" },
                          ]}
                          name={`nonInvasiveMechanicalVentilatorType`}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
              <div>
                <FormHeader className="mt-0 text-sm">
                  Other Treatments
                </FormHeader>
                <div className="grid gap-5">
                  <FormField
                    control={methods.control}
                    name={"isIVMedications"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">IV Medications</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`ivMedicationsType`}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0 ml-5">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "vasoactive-medications",
                              label: "Vasoactive medications",
                            },
                            { value: "antibiotics", label: "Antibiotics" },
                            {
                              value: "anticoagulation",
                              label: "Anticoagulation",
                            },
                            { value: "other", label: "Other" },
                          ]}
                          name={`ivMedicationsType`}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isTransfusions"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Transfusions</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isDialysis"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Dialysis</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`dialysisType`}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0 ml-5">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "hemodialysis", label: "Hemodialysis" },
                            {
                              value: "peritoneal-dialysis",
                              label: "Peritoneal dialysis",
                            },
                          ]}
                          name={`dialysisType`}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isIVAccess"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm"> IV Access</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`ivAccessType`}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0 ml-5">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "peripheral", label: "Peripheral" },
                            { value: "mid-line", label: "Mid-line" },
                            {
                              value: "central",
                              label: "Central (e.g., PICC, tunneled, port)",
                            },
                          ]}
                          name={`ivAccessType`}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isNone"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">None of the Above</span>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
              </div>
              <div>
                <FormHeader className="mt-0 text-sm">
                  Other Treatments
                </FormHeader>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">
                    (M2200) Therapy Need: In the home health plan of care for
                    the Medicare payment episode for which this assessment will
                    define a case mix group, what is the indicated need for
                    therapy visits (total of reasonable and necessary physical,
                    occupational, and speech language pathology visits
                    combined)? Enter zero "000" if no therapy visits indicated
                  </p>
                  <FormField
                    control={methods.control}
                    name={"numberOfTherapyVisits"}
                    render={({ field }) => (
                      <FormRender label="Number of Therapy Visits indicated (total of physical, occupational and speech language pathology combined):">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isNotApplicable"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            NA - Not applicable: No care mix group defined by
                            this assessment
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
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

export default SectionO;
