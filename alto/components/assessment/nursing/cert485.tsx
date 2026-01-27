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
import { parseData, validateVisitDate } from "@/lib";
import {
  locatorFrequencyDefaultvalues,
  LocatorFrequencyForm,
  locatorFrequencySchema,
} from "@/schema/assessment/nursing/locator-frequency";
import { ObjectData } from "@/types";

const Cert485 = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  timeIn,
  timeOut,
  visitDate,
  isQA,
}: {
  assessmentId?: string;
  data?: LocatorFrequencyForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  visitDate: Date;
  timeIn: string;
  timeOut: string;
  isQA: boolean;
}) => {
  const methods = useForm<LocatorFrequencyForm>({
    resolver: zodResolver(locatorFrequencySchema),
    defaultValues: locatorFrequencyDefaultvalues,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const {
    trigger: sendTOQA,
    isMutating: sendingToQA,
    data: response2,
  } = useSaveAssessment();
  const {
    trigger: updateQAStatus,
    isMutating: updating,
    data: updateresponse,
  } = useUpdateQAStatus();
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

  useEffect(() => {
    if (response2?.success) {
      toast.success("Data sent to QA successfully!");
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response2]);

  useEffect(() => {
    if (updateresponse?.success) {
      toast.success(updateresponse?.message);
      mutate();
      setAction(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateresponse]);

  const sendtoQA = async () => {
    if (validateVisitDate({ visitDate, timeIn, timeOut })) {
      await sendTOQA({
        nursingAssessment: parseData({
          ...assessment,
          cert485: methods.getValues(),
        }),
        patientScheduleId,
        caregiverId: authUser?.id as string,
        id: assessmentId,
        submittedAt: new Date(),
      });
    }
  };

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
            nursingAssessment: parseData({ ...assessment, cert485: data }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
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
                  <Button
                    className="px-6"
                    loading={sendingToQA}
                    variant="yellow"
                    type="button"
                    onClick={sendtoQA}
                  >
                    Send to QA
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
                25. 485 LOCATOR 21 FREQUENCY / ADVANCE DIRECTIVES/ POC TEMPLATE
                TEACHING (Skip by clicking Save&Continue if you do not wish to
                populate page to the POC)
              </FormHeader>
              <div className="grid gap-5">
                <div className="grid md:grid-cols-3 gap-5 border-b-2 pb-5">
                  <div className="flex flex-col gap-5">
                    <FormField
                      control={methods.control}
                      name={"snFrequency"}
                      render={({ field }) => (
                        <FormRender label={"SN Frequency:"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"snFrequencyDate"}
                      render={({ field }) => (
                        <FormRender label={"Beginning Week of:"}>
                          <DateInput {...field} value={field.value as Date} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"hhaFrequency"}
                      render={({ field }) => (
                        <FormRender label={"HHA Frequency:"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"hhaFrequencyDate"}
                      render={({ field }) => (
                        <FormRender label={"Beginning Week of:"}>
                          <DateInput {...field} value={field.value as Date} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-5">
                    <FormField
                      control={methods.control}
                      name={"prnVisit"}
                      render={({ field }) => (
                        <FormRender label={"PRN Visit x:"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <p className="text-sm font-semibold">
                      For problems related to:
                    </p>
                    <FormField
                      control={methods.control}
                      name={"problemRelatedTo"}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "catheter", label: "Catheter" },
                              { value: "ostomy", label: "Ostomy" },
                              { value: "wounds", label: "Wounds" },
                              { value: "lab-draws", label: "Lab Draws" },
                            ]}
                            name={"problemRelatedTo"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherPrnVisit"}
                      render={({ field }) => (
                        <FormRender label={"other"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-5">
                    <p className="text-sm font-semibold">
                      Patient allergic to:
                    </p>
                    <FormField
                      control={methods.control}
                      name={"allergicToMedication"}
                      render={({ field }) => (
                        <FormRender label={"Medication:"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"allergicToEnvironmental"}
                      render={({ field }) => (
                        <FormRender label={"Environmental (pollen, dust etc):"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"allergicToLatex"}
                      render={({ field }) => (
                        <FormRender formClassName="mt-4">
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Latex</span>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-5 border-b-2 pb-5">
                  <FormField
                    control={methods.control}
                    name={"establishedPoc"}
                    render={() => (
                      <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "SN",
                              label:
                                "SN: 1-2 visits in 60 days for comp-eval/asses and establish/re-establish Medicare Eligibility and/or discharge. (Use only for Therapy Cases)",
                            },
                            {
                              value: "PT",
                              label:
                                "PT: 1 MO 1 to eval/treat and establish POC",
                            },
                            {
                              value: "OT",
                              label:
                                "OT: 1 MO 1 to eval/treat and establish POC",
                            },
                            {
                              value: "ST",
                              label:
                                "ST: 1 MO 1 to eval/treat and establish POC",
                            },
                            {
                              value: "HHA",
                              label:
                                "HHA to assist with all ADL's, personal care, and hygiene needs per RN prepared care plan",
                            },
                            {
                              value: "MSW",
                              label:
                                "MSW: 1-3 visits in 60 days for evaluation/counseling for long term planning, financial and community resources",
                            },
                          ]}
                          name={"establishedPoc"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="flex flex-col gap-5">
                    <p className="text-sm font-semibold">
                      GOALS FOR HHA: Pt's personal care and hygiene, ADL's and
                      safety needs will 485tained during 60 day.
                    </p>
                    <p className="text-sm font-semibold">
                      GOALS FOR MSW: Optimal benefit obtained from MSW services
                      by end of 60 day episode.
                    </p>
                    <FormHeader className="my-0">SN/PT/OT TO ASSESS</FormHeader>
                    <p className="text-sm">All systems, with emphasis on:</p>
                    <FormField
                      control={methods.control}
                      name={"snPtOtToAssess"}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "neuro", label: "Neuro/Sensory" },
                              { value: "urinary", label: "Urinary" },
                              { value: "psychosocial", label: "Psychosocial" },
                              { value: "endocrine", label: "Endocrine" },
                              { value: "respiratory", label: "Respiratory" },
                              {
                                value: "musculoskeletal",
                                label: "Musculoskeletal",
                              },
                              { value: "pain", label: "Pain" },
                              {
                                value: "cardiovascular",
                                label: "Cardiovascular",
                              },
                              { value: "digestive", label: "GI/Digestive" },
                              {
                                value: "integumentary",
                                label: "Integumentary",
                              },
                            ]}
                            name={"snPtOtToAssess"}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-5">
                    <p className="text-sm font-semibold">Assess:</p>
                    <FormField
                      control={methods.control}
                      name={"assess"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "pertinent-findings",
                                label:
                                  "V/S's and report abnormal or pertinent findings",
                              },
                              { value: "temp", label: "Temp <95 or >100.0" },
                              {
                                value: "pulse",
                                label: "Pulse <50 or >110/min",
                              },
                              { value: "resp", label: "Resp <12 or >28/min" },
                              {
                                value: " Systolic-BP",
                                label:
                                  "Systolic BP <90mmHG or >160mmHG and/or diastolic BP <50 or >100mmHG",
                              },
                              {
                                value: "report-fasting-BS",
                                label: "Report Fasting BS > 300; or < 70 mg/dl",
                              },
                              {
                                value: "report-random-BS",
                                label:
                                  "Report Random BS > 350 mg/dl; or <80mg/dl to physician",
                              },
                            ]}
                            name={"assess"}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 border-b-2 pb-5">
                  <div className="flex flex-col gap-5">
                    <FormField
                      control={methods.control}
                      name={"instructSettings"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "hold-home-health-service",
                                label:
                                  "Hold Home Health Services if patient transfers to inpatient facility. May resume Home Health Services upon discharge from in patient facility before 61st day of episode",
                              },
                              {
                                value: "access-patient-response",
                                label:
                                  "SN to assess patient's response to new/changed medications, instruct pt/cg in medication regimen, including schedule, purpose, and possible side effects or adverse reactions",
                              },
                              {
                                value: "med-minder",
                                label:
                                  "SN to assist or instruct setting up a med minder",
                              },
                              {
                                value: "adequate-nutrition",
                                label:
                                  "SN to assess/instruct pt/cg in adequate nutrition/hydration",
                              },
                              {
                                value: "emergency-preparedness",
                                label:
                                  "SN to assess/instruct pt/cg in emergency preparedness",
                              },
                              {
                                value: "disease-processes",
                                label:
                                  "SN to assess/instruct pt/cg in all aspects of disease processes, s/sx of exacerbation home management of disease process(es) and when to notify nurse or physician",
                              },
                              {
                                value: "accept-orders",
                                label: "SN may accept orders from:",
                              },
                            ]}
                            name={"instructSettings"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"snMayAcceptOrdersFrom"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"snPtToAssess"}
                      render={({ field }) => (
                        <FormRender
                          label={"SN/PT to Assess (include parameters):"}
                        >
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-5">
                    <FormHeader className="my-0">
                      VENIPUNCTURE/LAB ORDERS
                    </FormHeader>
                    <FormField
                      control={methods.control}
                      name={"isVenipunctureSnToObtain"}
                      render={({ field }) => (
                        <FormRender formClassName="mt-4">
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">SN to obtain:</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"perVenipuncture"}
                      render={({ field }) => (
                        <FormRender
                          label={"Per venipuncture or micro-coagulation unit:"}
                        >
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"perFingerStick"}
                      render={({ field }) => (
                        <FormRender
                          label={
                            "Per finger stick for PT/INR q (frequency):Per finger stick for PT/INR q (frequency):"
                          }
                        >
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"venipunctureSnPtToTeachPerform"}
                      render={({ field }) => (
                        <FormRender
                          label={"SN/PT to Teach/Perform: (narrative)"}
                        >
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormHeader className="my-0">
                      NEUROLOGICAL ORDERS
                    </FormHeader>
                    <FormField
                      control={methods.control}
                      name={"knowledgeDeficits"}
                      render={({ field }) => (
                        <FormRender formClassName="mt-4">
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              SN to assess/instruct pt/cg on knowledge deficits
                              in s/sx or management of:
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"knowledgeDeficitsDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"neurologicalOrders"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "seizure-activity",
                                label:
                                  "SN to assess pt on seizure activity and instruct on seizures and associated safety precautions",
                              },
                              {
                                value: "depression-screening",
                                label:
                                  "SN to assess depression screening (PHQ2) every visit (check only if PHQ2 result nearly everyday (12-14 days)",
                              },
                            ]}
                            name={"neurologicalOrders"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"neurologicalSnPtToTeachPerform"}
                      render={({ field }) => (
                        <FormRender label={"SN/PT to Teach/Perform:"}>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5 border-b-2 pb-5">
                  <div className="flex flex-col gap-5">
                    <FormHeader className="my-0">CARDIAC ORDERS</FormHeader>
                    <FormField
                      control={methods.control}
                      name={"cardicOrders"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "prn-weekly-gain",
                                label:
                                  "SN to weigh pt PRN/weekly and report gain of 3 lbs in one day or 5 lbs in one week to MD",
                              },
                              {
                                value: "prn-diuretics",
                                label:
                                  "SN will instruct pt/cg on prn diuretics for any exacerbation of CHF (SN must request prn order from MD)",
                              },
                              {
                                value: "anticoagulation-therapy",
                                label:
                                  "SN to instruct pt/cg in anticoagulation therapy including medication dosing, purpose of lab draws for PT/INR, safety, foods to avoid and what s/s to report",
                              },
                            ]}
                            name={"cardicOrders"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"cardicSnPtToTeachPerform"}
                      render={({ field }) => (
                        <FormRender label={"SN/PT to Teach/Perform:"}>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormHeader className="my-0">RESPIRATORY ORDERS</FormHeader>
                    <FormField
                      control={methods.control}
                      name={"respiratoryOrders"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "fire-risk-assessment",
                                label:
                                  "SN to perform fire risk assessment such as: No smoking sign posted, smoke detector present and working, exit plan available, electrical cords intact near oxygen, and medical gas cylinder stored in stable protected area",
                              },
                              {
                                value: "oxygen-inhalation-therapy",
                                label:
                                  "SN to instruct pt/cg in oxygen inhalation therapy including safety precautions, infection control and care of equipment",
                              },
                              {
                                value: "pulse-oximetry-prn",
                                label:
                                  "SN may check O2 sats per pulse oximetry PRN for assessment or signs of Resp difficulty, notify physician if O2 sats < 90%",
                              },
                              {
                                value: "aerosol-inhalers",
                                label:
                                  "SN to assess/instruct pt/cg on effectiveness of aerosol inhalers and nebulizer",
                              },
                              {
                                value: "nebulizer-unit-prn",
                                label:
                                  "SN to instruct pt/cg on how to properly use of nebulizer unit at home",
                              },
                              {
                                value: "sterile-technique",
                                label:
                                  "SN to instruct/perform trach care/endotracheal suctioning/oral suctioning using sterile technique/aseptic technique during SN visits",
                              },
                              {
                                value: "complications",
                                label:
                                  "SN to assess/instruct pt/cg s/sx of complications or infections",
                              },
                              {
                                value: "dressing-change",
                                label:
                                  "SN to instruct pt/cg on dressing change to trach as follows:",
                              },
                            ]}
                            name={"respiratoryOrders"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"respiratoryOrdersDressingChange"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"respiratorySnPtToTeachPerform"}
                      render={({ field }) => (
                        <FormRender label={"SN/PT to Teach/Perform:"}>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-5">
                    <FormHeader className="my-0">DIABETIC ORDERS</FormHeader>
                    <FormField
                      control={methods.control}
                      name={"diabeticOrders"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "blood-sugar-log",
                                label:
                                  "SN to assess pt/cg ability and compliance to keep blood sugar log",
                              },
                              {
                                value: "hyperglycemia-hypoglycemia",
                                label:
                                  "SN to assess for s/s of hyperglycemia and hypoglycemia",
                              },
                              {
                                value: "finger-stick-glucose-check-prn",
                                label:
                                  "SN to perform finger stick glucose check prn using aseptic technique",
                              },
                              {
                                value: "insulin-orders",
                                label:
                                  "SN to prepare/administer Insulin orders prescribed by physician using aseptic technique",
                              },
                              {
                                value: "peanut-butter-meat-sandwich",
                                label:
                                  "SN may give 1/2 cup of #fff6e5 juice or 3-5 pieces of hard candy for BS less than 70mg/dl with symptoms of hypoglycemia. Recheck BS in 15 minutes, if BS still less than 70mg/dl 1/2 peanut butter or meat sandwich and 1/2 cup of milk. Recheck BS in another 15 min, if still low, call 911 and notify case manager and physician",
                              },
                              {
                                value: "foot-care-orders",
                                label:
                                  "SN to perform diabetic foot care including monitoring for presence of skin lesions on the lower extremeties",
                              },
                              {
                                value: "foot-care-instructions",
                                label:
                                  "SN to instruct pt/cg on proper foot care",
                              },
                            ]}
                            name={"diabeticOrders"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"diabeticSnPtToTeachPerform"}
                      render={({ field }) => (
                        <FormRender label={"SN/PT to Teach/Perform:"}>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormHeader className="my-0">
                      MUSCULOSKELETAL ORDERS
                    </FormHeader>
                    <FormField
                      control={methods.control}
                      name={"musculoskeletalOrders"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "pain-management",
                                label:
                                  "SN to assess/instruct pt/cg on interventions in pain management, including pharmacological and comfort measures",
                              },
                              {
                                value: "tug-testing",
                                label:
                                  "SN to assess home for safety, assess for risk for fall every visit using TUG testing (check only if TUG result is > 14 sec)",
                              },
                            ]}
                            name={"musculoskeletalOrders"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"musculoskeletalSnPtToTeachPerform"}
                      render={({ field }) => (
                        <FormRender label={"SN/PT to Teach/Perform:"}>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5 border-b-2 pb-5">
                  <div className="flex flex-col gap-5">
                    <FormHeader className="my-0">
                      BOWEL/URINARY REGIMEN ORDERS
                    </FormHeader>
                    <FormField
                      control={methods.control}
                      name={"bowelRegimenOrders"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "ostomy-appliance",
                                label:
                                  "SN to instruct pt/cg on application of ostomy appliance, care and storage of equipment, and how to order supplies after discharge",
                              },
                              {
                                value: "care-of-stoma",
                                label:
                                  "SN to assess/instruct pt/cg on care of stoma, surrounding skin, s/sx of infection or irritation, and use of skin barrier, PRN, SN may perform G-site care using aseptic technique as follows:",
                              },
                              {
                                value: "feedings-orders",
                                label:
                                  "SN to assess/instruct pt/cg on all aspects of G-tube feeding, including administration of feeding formula and medications, and residual checks before feedings",
                              },
                              {
                                value: "notify-nurse-physician",
                                label:
                                  "SN to instruct pt/cg when to notify nurse or physician for complications and symptoms of aspiration",
                              },
                              {
                                value: "fecal-impaction-and-remove",
                                label:
                                  "SN to check PRN for fecal impaction and remove manually and SN may give enema of choice for relief of constipation/impaction PRN",
                              },
                              {
                                value: "indwelling-foley-catheter",
                                label:
                                  "SN to assess indwelling Foley catheter for patency, character of urine, an s/sx of infection or malfunction",
                              },
                              {
                                value: "catheter-suprapubic",
                                label:
                                  "SN to change indwelling Foley catheter/Suprapubic catheter q monthly or PRN for leakage, obstruction, or dislodgement with a Foley cath balloon using sterile technique:",
                              },
                              {
                                value: "irrigate-foley",
                                label:
                                  "SN may irrigate indwelling Foley catheter with 3 - 60cc of sterile irrigating solution as needed for leakage or obstruction",
                              },
                              {
                                value: "intermittent-catheterization",
                                label:
                                  "SN to instruct pt/cg on intermittent catheterization and complications to report to nurse or physician. SN may perform intermittent catheterizations using sterile technique every:",
                              },
                            ]}
                            name={"bowelRegimenOrders"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"careOfStoma"}
                      render={({ field }) => (
                        <FormRender label="Care of Stoma">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"cathererSuprapubicFr"}
                      render={({ field }) => (
                        <FormRender label="Fr:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"cathererSuprapubicCc"}
                      render={({ field }) => (
                        <FormRender label="cc:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"intermittentCatheterization"}
                      render={({ field }) => (
                        <FormRender label="Intermittent Catheterization">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"bowelRegimenOrdersSnPtToTeachPerform"}
                      render={({ field }) => (
                        <FormRender label={"SN/PT to Teach/Perform"}>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-5">
                    <FormHeader className="my-0">
                      INTEGUMENTARY ORDERS
                    </FormHeader>
                    <FormField
                      control={methods.control}
                      name={"integumentaryOrders"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "pressure-ulcer-assessment",
                                label:
                                  "SN to assess perform pressure ulcer assessment every visit using Braden scale (check only if Braden scale result of 13-14 - moderate risk)",
                              },
                              {
                                value: "limited-mobility",
                                label:
                                  "SN to instruct pt/cg on limited mobility and about skin care needs including frequent position changes, pressure relief devices, and prevention of skin breakdown",
                              },
                              {
                                value: "bowel-incontinence",
                                label:
                                  "SN to instruct pt/cg on bladder incontinence/bowel incontinence, skin care, and incontinent containment products to prevent skin irritation or breakdown",
                              },
                              {
                                value: "pressure-ulcer-treatment",
                                label:
                                  "SN to perform pressure ulcer treatment based on principles of moist wound healing (order needs to be obtained from physician)",
                              },
                            ]}
                            name={"integumentaryOrders"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"isSnToAccess"}
                      render={({ field }) => (
                        <FormRender formClassName="mt-4">
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">SN to assess</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"sntoAssess"}
                      render={() => (
                        <FormRender formClassName="flex  flex-wrap gap-5 pl-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "wound", label: "Wound" },
                              { value: "incision", label: "Incision" },
                              { value: "decubitus", label: "Decubitus" },
                            ]}
                            name={"sntoAssess"}
                          />
                        </FormRender>
                      )}
                    />
                    <p className="text-sm">
                      for s/sx of infection or healing complications and
                      evaluate effectiveness of treatment
                    </p>
                    <div className="grid gap-5 border-y-2 py-5">
                      <FormField
                        control={methods.control}
                        name={"aspecticTechnique"}
                        render={({ field }) => (
                          <FormRender label="Specify each location using aseptic technique:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"dressingToBeChanged"}
                        render={({ field }) => (
                          <FormRender label="Dressing to be changed (frequency):">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <FormField
                      control={methods.control}
                      name={"otherIntegumentaryOrders"}
                      render={() => (
                        <FormRender formClassName="flex  flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "infection-control",
                                label:
                                  "SN to instruct pt/cg on wound care, infection control, and s/sx of infection or complications to report to nurse or physician",
                              },
                              {
                                value: "caregiver-willing",
                                label:
                                  "SN to perform dressing change daily until there, there is a caregiver willing/available. Projected endpoint to daily SN visits will be on:",
                              },
                            ]}
                            name={"otherIntegumentaryOrders"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"caregiverWilling"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"integumentarySnPtToTeachPerform"}
                      render={({ field }) => (
                        <FormRender label={"SN/PT to Teach/Perform"}>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-5 border-b-2 pb-5">
                  <div className="flex flex-col gap-5">
                    <FormHeader className="my-0">RENAL ORDERS</FormHeader>
                    <FormField
                      control={methods.control}
                      name={"renalOrders"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "renal-diet",
                                label:
                                  "SN to instruct pt/cg on renal diet prescribed by physician",
                              },

                              {
                                value: "hickman-groshong",
                                label:
                                  "SN to assess Hickman, Groshong, Triple Lumen (select one) or (fill specific type) for s/sx of infection and presence of bruit/thrill:",
                              },
                            ]}
                            name={"renalOrders"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"hickmanGroshong"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"renalSnPtToTeachPerform"}
                      render={({ field }) => (
                        <FormRender label="SN/PT to Teach/Perform:">
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormHeader className="my-0">
                      GOALS/EXPECTED OUTCOMES
                    </FormHeader>
                    <FormField
                      control={methods.control}
                      name={"expectedOutcomes"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "disease-process",
                                label:
                                  "Pt/cg will verbalize knowledge of disease process, s/sx of exacerbations and when to notify MD by EOEn",
                              },

                              {
                                value: "bp-range",
                                label:
                                  "BP range will be WNL or within MD prescribed parameters by EOE",
                              },
                              {
                                value: "knowledgeable-of",
                                label: "Pt will be knowledgeable of:",
                              },
                            ]}
                            name={"expectedOutcomes"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"knowledgeableOf"}
                      render={() => (
                        <FormRender formClassName="flex pl-5 flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "medication-regimen",
                                label: "Medication Regimen",
                              },

                              {
                                value: "exacerbation",
                                label:
                                  "s/sx of exacerbation and when to notify physician/SN",
                              },
                            ]}
                            name={"knowledgeableOf"}
                          />
                        </FormRender>
                      )}
                    />
                    <div className="grid gap-5">
                      <FormField
                        control={methods.control}
                        name={"painManagedAt"}
                        render={({ field }) => (
                          <FormRender formClassName="mt-4">
                            <div className="flex gap-2 items-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <span className="text-sm">
                                Pt's pain will be managed at:
                              </span>
                            </div>
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"renalOutcomeScale"}
                        render={({ field }) => (
                          <FormRender label="On the scale of 0-10 within:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"renalOutcomeTime"}
                        render={({ field }) => (
                          <FormRender label="Days">
                            <Input
                              {...field}
                              value={field.value as string}
                              placeholder="60days"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-5">
                    <FormField
                      control={methods.control}
                      name={"ptWill"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Pt will:</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"maintain"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Maintain</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"nutritionStatus"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Improve nutritional status during 60 days as
                              evidenced by:
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"weightGain"}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap pl-5 gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "weight-gain", label: "Weight Gain" },
                              {
                                value: "no-weight-gain",
                                label: "No Weight Gain",
                              },
                            ]}
                            name={"weightGain"}
                          />
                        </FormRender>
                      )}
                    />
                    <div className="grid gap-5 border-t-2 pt-5">
                      <FormField
                        control={methods.control}
                        name={"scaleAssessment"}
                        render={() => (
                          <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                            <CheckboxGroup
                              methods={methods}
                              options={[
                                {
                                  value: "braden-scale",
                                  label:
                                    "Pt will have Braden scale result of 15-18 (mild risk) during 60 days",
                                },
                                {
                                  value: "fall-risk-assessment",
                                  label:
                                    "Pt will have Fall Risk assessment using TUG testing with result of < 14 sec at the end of episode",
                                },
                                {
                                  value: "depression-screening",
                                  label:
                                    'Pt will have depression screening using PHQ 2 scale with result of "NOT at all" during cert period',
                                },
                                {
                                  value: "seizures",
                                  label:
                                    "Seizures will be well controlled during this 60 day episode",
                                },
                                {
                                  value: "abnormal-bleeding",
                                  label:
                                    "Pt will not experience any abnormal bleeding from anticoagulant therapy during 60 day period",
                                },
                                {
                                  value: "pulmonary-status",
                                  label:
                                    "Pulmonary status will improve as evidenced by adequate oxygenation, less dyspnea, improved activity tolerance, and ability to perform ADL's without exhaustion by EOE",
                                },
                                {
                                  value: "complication-of-diabetes",
                                  label:
                                    "Pt will have Fasting BS levels of 70mg/dl - 140mg/dl and or Random BS levels of 80mg/dl - 160mg/dl and pt will not demostrate exacerbation/complication of diabetes within 60 days",
                                },
                                {
                                  value: "notify-physician",
                                  label:
                                    "Pt/cg will maintain BS log and notify physician if BS are:",
                                },
                              ]}
                              name={"scaleAssessment"}
                            />
                          </FormRender>
                        )}
                      />
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{"<"}</p>
                        <FormField
                          control={methods.control}
                          name={"lessThan"}
                          render={({ field }) => (
                            <FormRender>
                              <Input {...field} value={field.value as string} />
                            </FormRender>
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{"or >"}</p>
                        <FormField
                          control={methods.control}
                          name={"greaterThan"}
                          render={({ field }) => (
                            <FormRender>
                              <Input {...field} value={field.value as string} />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-5">
                    <FormField
                      control={methods.control}
                      name={"isPtWoundSign"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Pt's wound will show signs of healing within:
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"ptWoundSignDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <p className="text-sm font-semibold">As evidenced by:</p>
                    <FormField
                      control={methods.control}
                      name={"evidenceBy"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "decreased-exudates",
                                label: "Decreased Exudates",
                              },
                              { value: "granulation", label: "Granulation" },
                              {
                                value: "decreased-size",
                                label: "Decreased Size",
                              },
                            ]}
                            name={"evidenceBy"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherEvidenceBy"}
                      render={({ field }) => (
                        <FormRender label="Other">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"isIndependentWithWoundCare"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Pt/cg will be independent with wound care and
                              management as evidenced by return demo and
                              verbalization by:
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"independentWithWoundCareDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"isPt"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Pt's:</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"ptDetails"}
                      render={() => (
                        <FormRender formClassName="flex flex-col flex-wrap gap-5 pl-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "foley", label: "Foley" },
                              {
                                value: "supra-pubic-cath",
                                label: "Supra pubic cath",
                              },
                              {
                                value: "g-tube",
                                label:
                                  "G-tube will remain patent and free from complications for next 60 days",
                              },
                            ]}
                            name={"ptDetails"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"ptToTeachPerform"}
                      render={({ field }) => (
                        <FormRender label="SN/PT to Teach/Perform:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                Goals/Rehabilitation potential/Discharge plans
              </FormHeader>
              <div className="grid md:grid-cols-3 gap-5 text-center  py-2 bg-secondary items-center justify-center font-semibold">
                <p>Service</p>
                <p>Goals</p>
                <p>Rehabilitation potential</p>
              </div>
              <div className="grid gap-5 py-5">
                <div className="grid md:grid-cols-3 gap-5">
                  <FormField
                    control={methods.control}
                    name={"dischargePlanService"}
                    render={({ field }) => (
                      <FormRender>
                        <SelectInput
                          options={[
                            { label: "PT", value: "PT" },
                            { label: "SN", value: "SN" },
                            { label: "OT", value: "OT" },
                            { label: "ST", value: "ST" },
                          ]}
                          field={field}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"dischargePlanGoals"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"dischargePlanRehabilitationPotential"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="grid md:grid-cols-2 gap-5 text-center py-2 bg-secondary items-center justify-center font-semibold">
                <p>Patient Care Preferences</p>
                <p>Rehabilitation potential</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5 py-5">
                <FormField
                  control={methods.control}
                  name={"patientCarePreferences"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"patientCareRehabilitationPotential"}
                  render={({ field }) => (
                    <FormRender>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <div className="grid md:grid-cols-2 gap-5 text-center py-2 bg-secondary items-center justify-center font-semibold">
                <p>Patient Identified Goals</p>
                <p>Rehabilitation potential</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5 py-5">
                <FormField
                  control={methods.control}
                  name={"patientIdentifiedGoals"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"patientIdentifiedRehabilitationPotential"}
                  render={({ field }) => (
                    <FormRender>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">HOMEBOUND STATUS</FormHeader>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-5">
                  <p className="text-sm font-semibold">
                    Describe the patient's functional status that renders
                    him/her homebound. Must meet Criteria One A or B and
                    Criteria Two A & B.
                  </p>
                  <FormField
                    control={methods.control}
                    name={"citeriaOneA"}
                    render={({ field }) => (
                      <FormRender label="Criteria One: A. Requires the assistance of supportive device, use of special transportation, or the assistance of another person to leave home (describe/explain):">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"citeriaOneB"}
                    render={({ field }) => (
                      <FormRender label="Or B. Leaving the home is medically contraindicated (describe/explain):">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"citeriaTwoA"}
                    render={({ field }) => (
                      <FormRender label="AND Criteria Two: A. There exists a normal inability to leave home (describe/explain):">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"citeriaTwoB"}
                    render={({ field }) => (
                      <FormRender label="AND B. Leaving home requires a considerable taxing effort (describe/explain):">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"absencesFromHome"}
                    render={({ field }) => (
                      <FormRender label="AND Absences from the home are infrequent, or relatively short duration, or to receive medical care (describe):">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-5">
                  <FormHeader className="my-0">
                    HOSPITAL RISK ASSESSMENT / NECESSARY INTERVENTION TO ADRESS
                    RISK
                  </FormHeader>
                  <FormField
                    control={methods.control}
                    name={"hospitalRiskAssessment"}
                    render={({ field }) => (
                      <FormRender label="Hospital Risk Assessment/Necessary Intervention To Adress Risk">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <p className="text-sm font-semibold text-center">
                    Enter the following in 487 - addendum page:
                  </p>
                  <FormHeader className="my-0">REHAB POTENTIAL</FormHeader>
                  <FormField
                    control={methods.control}
                    name={"rehabPotential"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "excellent", label: "Excellent" },
                            { value: "guarded", label: "Guarded" },
                            { value: "good", label: "Good" },
                            {
                              value: "poor",
                              label: "Poor - To accomplish goals established",
                            },
                            { value: "fair", label: "Fair" },
                          ]}
                          name={"rehabPotential"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormHeader className="my-0">DISCHARGE PLANS</FormHeader>
                  <FormField
                    control={methods.control}
                    name={"dischargePlans"}
                    render={() => (
                      <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "wound-healed",
                              label:
                                "Discharge when wounds are healed and or willing and available caregivers identified to perform wound care",
                            },
                            {
                              value: "blood-sugar",
                              label:
                                "Discharge when pt able to perform blood sugar testing accurately and or cg willing and able to perform blood sugar testing",
                            },
                            {
                              value: "caregiver-under-supervision",
                              label:
                                "Discharge to self/caregiver/family under MD supervision when:",
                            },
                          ]}
                          name={"dischargePlans"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"caregiverUnderSupervision"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap gap-5 !space-y-0 pl-5">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "goals-met", label: "Goals met" },
                            {
                              value: "skilled-service",
                              label: "Skilled services are no longer needed",
                            },
                          ]}
                          name={"caregiverUnderSupervision"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"dischargePlanSnPtToTeachPerform"}
                    render={({ field }) => (
                      <FormRender label="SN/PT to Teach/Perform:">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="grid md:grid-cols-4 gap-5 text-center mt-4 py-2 bg-secondary items-center justify-center font-semibold">
                <p>Orders</p>
                <p>LOS(Length of session)</p>
                <p>Frequency</p>
                <p>Duration</p>
              </div>
              <div className="grid gap-5 py-5">
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Administration of medications
                  </p>
                  <FormField
                    control={methods.control}
                    name={"adminstrationOfMedicationsLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"adminstrationOfMedicationsFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"adminstrationOfMedicationsDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">Tube feeding</p>
                  <FormField
                    control={methods.control}
                    name={"tubeFeedingLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"tubeFeedingFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"tubeFeedingDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">Wound care</p>
                  <FormField
                    control={methods.control}
                    name={"woundCareLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"woundCareFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"woundCareDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">Catheters</p>
                  <FormField
                    control={methods.control}
                    name={"cathetersLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"cathetersFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"cathetersDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">Ostomy care</p>
                  <FormField
                    control={methods.control}
                    name={"ostomyCareLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"ostomyCareFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"ostomyCareDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    NG and tracheostomy aspiration/care
                  </p>
                  <FormField
                    control={methods.control}
                    name={"tracheostomyAspirationCareLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"tracheostomyAspirationCareFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"tracheostomyAspirationCareDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    psychiatric evaluation and therapy
                  </p>
                  <FormField
                    control={methods.control}
                    name={"psychiatricEvaluationLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"psychiatricEvaluationFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"psychiatricEvaluationDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">Teaching/training</p>
                  <FormField
                    control={methods.control}
                    name={"teachingLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"teachingFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"teachingDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">Observe/assess</p>
                  <FormField
                    control={methods.control}
                    name={"observeLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"observeFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"observeDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Complex care plan management
                  </p>
                  <FormField
                    control={methods.control}
                    name={"complexCarePlanLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"complexCarePlanFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"complexCarePlanDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Rehabilitation nursing
                  </p>
                  <FormField
                    control={methods.control}
                    name={"rehabilitationNursingLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"rehabilitationNursingFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"rehabilitationNursingDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"othertitle"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex items-center gap-5">
                          <p className="text-sm font-semibold">Other</p>
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"otherLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"skilledOversightJustification"}
                  render={({ field }) => (
                    <FormRender label="Justification and signature if the patients sole skilled need is for skilled oversight of unskilled services (management and evaluation of the care plan or complex care plan management):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"skilledOversightSignature"}
                  render={({ field }) => (
                    <FormRender label="Signature:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <div className="grid md:grid-cols-4 gap-5 text-center  py-2 bg-secondary items-center justify-center font-semibold">
                <p>Therapy services</p>
                <p>LOS(Length of session)</p>
                <p>Frequency</p>
                <p>Duration</p>
              </div>
              <div className="grid gap-5 py-5">
                <p className="text-lg font-semibold">Physical therapy:</p>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Restore patient function
                  </p>
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyRestorePatientFunctionLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyRestorePatientFunctionFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyRestorePatientFunctionDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Perform maintenance therapy
                  </p>
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyPerformMaintenanceTherapyLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyPerformMaintenanceTherapyFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyPerformMaintenanceTherapyDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">Therapeutic exercises</p>
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyTherapeuticExercisesLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyTherapeuticExercisesFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyTherapeuticExercisesDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Gait and balance training
                  </p>
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyGaitAndBalanceTrainingLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyGaitAndBalanceTrainingFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyGaitAndBalanceTrainingDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">ADL training</p>
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyAdlTrainingLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyAdlTrainingFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyAdlTrainingDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"otherPhysicalTherapy"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex items-center gap-5">
                          <p className="text-sm font-semibold">Other</p>
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherPhysicalTherapyLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherPhysicalTherapyFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherPhysicalTherapyDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <p className="text-lg font-semibold">Occupational therapy:</p>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Restore patient function
                  </p>
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyRestorePatientFunctionLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyRestorePatientFunctionFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyRestorePatientFunctionDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Perform maintenance therapy
                  </p>
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyPerformMaintenanceTherapyLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={
                      "occupationalTherapyPerformMaintenanceTherapyFrequency"
                    }
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={
                      "occupationalTherapyPerformMaintenanceTherapyDuration"
                    }
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">Therapeutic exercises</p>
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyTherapeuticExercisesLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyTherapeuticExercisesFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyTherapeuticExercisesDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Gait and balance training
                  </p>
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyGaitAndBalanceTrainingLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyGaitAndBalanceTrainingFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyGaitAndBalanceTrainingDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">ADL training</p>
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyAdlTrainingLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyAdlTrainingFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyAdlTrainingDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"otherOccupationalTherapy"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex items-center gap-5">
                          <p className="text-sm font-semibold">Other</p>
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherOccupationalTherapyLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherOccupationalTherapyFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherOccupationalTherapyDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"otServicesProvided"}
                  render={() => (
                    <FormRender
                      label="Are OT services above provided because physical therapy services ceased?: "
                      formClassName="flex flex-wrap gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                        name={"otServicesProvided"}
                      />
                    </FormRender>
                  )}
                />
                <p className="text-lg font-semibold">
                  Speech-language pathology:
                </p>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">Swallowing</p>
                  <FormField
                    control={methods.control}
                    name={"swallowingLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"swallowingFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"swallowingDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Restore language function
                  </p>
                  <FormField
                    control={methods.control}
                    name={"restoreLanguageFunctionLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"restoreLanguageFunctionFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"restoreLanguageFunctionDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Restore cognitive function
                  </p>
                  <FormField
                    control={methods.control}
                    name={"restoreCognitiveFunctionLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"restoreCognitiveFunctionFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"restoreCognitiveFunctionDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Perform maintenance therapy
                  </p>
                  <FormField
                    control={methods.control}
                    name={"performMaintenanceTherapyLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"performMaintenanceTherapyFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"performMaintenanceTherapyDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"otherLanguagePathology"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex items-center gap-5">
                          <p className="text-sm font-semibold">Other</p>
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherLanguagePathologyLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherLanguagePathologyFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherLanguagePathologyDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <p className="text-lg font-semibold">Other Services:</p>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Home health aide services
                  </p>
                  <FormField
                    control={methods.control}
                    name={"homeHealthAideServicesLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"homeHealthAideServicesFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"homeHealthAideServicesDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                  <p className="text-sm font-semibold">
                    Medical social services
                  </p>
                  <FormField
                    control={methods.control}
                    name={"medicalSocialServicesLos"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"medicalSocialServicesFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"medicalSocialServicesDuration"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end text-end my-2 gap-2">
          {!isQA ? (
            <>
              <Button className="px-6" loading={isMutating}>
                Save Changes
              </Button>
              <Button
                className="px-6"
                loading={sendingToQA}
                variant="yellow"
                type="button"
                onClick={sendtoQA}
              >
                Send to QA
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

export default Cert485;
