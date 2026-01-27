import React from "react";

import FormHeader from "@/components/form-header";
import {
  Checkbox,
  CheckboxGroup,
  DateInput,
  FormField,
  FormRender,
  Input,
  Textarea,
} from "@/components/ui";
import { additionalFieldTwoSchema } from "@/schema/assessment/soc-assess/additional-field-two";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldTwoSchema>;

const AdvancedDirective = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">
          25. 485 LOCATOR #21 FREQUENCY / ADVANCE DIRECTIVES/ POC TEMPLATE
          TEACHING (Skip by clicking Save&Continue if you do not wish to
          populate page to the POC)
        </FormHeader>
        <div className="grid gap-5">
          <div className="grid lg:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"snFrequency"}
              render={({ field }) => (
                <FormRender label="SN Frequency:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"snBeginningOfWeek"}
              render={({ field }) => (
                <FormRender label="Beginning Week of:">
                  <DateInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"hhaFrequency"}
              render={({ field }) => (
                <FormRender label="HHA Frequency:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"hhaBeginningOfWeek"}
              render={({ field }) => (
                <FormRender label="Beginning Week of:">
                  <DateInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-3 gap-5 items-end  border border-dashed p-2">
            <FormField
              control={methods.control}
              name={"prnVisitX"}
              render={({ field }) => (
                <FormRender label="PRN Visit x:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <div>
              <p className="text-sm font-semibold pb-2">
                For problems related to:
              </p>
              <FormField
                control={methods.control}
                name={"evaluations"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "catheter", label: "Catheter" },
                        { value: "wounds", label: "Wounds" },
                        { value: "ostomy", label: "Ostomy" },
                        { value: "lab-draws", label: "Lab Draws" },
                      ]}
                      name={"evaluations"}
                    />
                  </FormRender>
                )}
              />
            </div>
            <FormField
              control={methods.control}
              name={"otherProblemRelatedTo"}
              render={({ field }) => (
                <FormRender label="Other:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-3 gap-5 border border-dashed p-2 items-end">
            <p className="text-sm font-semibold lg:col-span-3">
              Patient allergic to:
            </p>
            <FormField
              control={methods.control}
              name={"patientAllergicToMedication"}
              render={({ field }) => (
                <FormRender label="Medication:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"allergicToEnvironmental"}
              render={({ field }) => (
                <FormRender label="Environmental (pollen, dust etc):">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"isAllergicToLatex"}
              render={({ field }) => (
                <FormRender>
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
          <FormField
            control={methods.control}
            name={"advancedDirective"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    {
                      value: "sn",
                      label:
                        "SN: 1-2 visits in 60 days for comp-eval/asses and establish/re-establish Medicare Eligibility and/or discharge. (Use only for Therapy Cases)",
                    },
                    {
                      value: "pt",
                      label: "PT: 1 MO 1 to eval/treat and establish POC",
                    },
                    {
                      value: "ot",
                      label: "OT: 1 MO 1 to eval/treat and establish POC",
                    },
                    {
                      value: "st",
                      label: "ST: 1 MO 1 to eval/treat and establish POC",
                    },
                    {
                      value: "hha",
                      label:
                        "HHA to assist with all ADL's, personal care, and hygiene needs per RN prepared care plan",
                    },
                    {
                      value: "msw",
                      label:
                        "MSW: 1-3 visits in 60 days for evaluation/counseling for long term planning, financial and community resources",
                    },
                  ]}
                  name={"advancedDirective"}
                />
              </FormRender>
            )}
          />
          <p className="text-sm font-semibold">
            GOALS FOR HHA: Pt's personal care and hygiene, ADL's and safety
            needs will be maintained during 60 day.
          </p>
          <p className="text-sm font-semibold">
            GOALS FOR MSW: Optimal benefit obtained from MSW services by end of
            60 day episode.
          </p>
        </div>
      </div>

      <div>
        <FormHeader className="mt-4">SN/PT/OT TO ASSESS</FormHeader>
        <div className="grid gap-5">
          <div>
            <p className="text-sm font-semibold pb-2">
              All systems, with emphasis on:
            </p>
            <FormField
              control={methods.control}
              name={"allSystems"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "neuro", label: "Neuro/Sensory" },
                      { value: "psychosocial", label: "Psychosocial" },
                      { value: "respiratory", label: "Respiratory" },
                      { value: "pain", label: "Pain" },
                      { value: "digestive", label: "GI/Digestive" },
                      { value: "urinary", label: "Urinary" },
                      { value: "endocrine", label: "Endocrine" },
                      { value: "musculoskeletal", label: "Musculoskeletal" },
                      { value: "cardiovascular", label: "Cardiovascular" },
                      { value: "integumentary", label: "Integumentary" },
                    ]}
                    name={"allSystems"}
                  />
                </FormRender>
              )}
            />
          </div>
          <div>
            <p className="text-sm font-semibold pb-2">Assess:</p>
            <FormField
              control={methods.control}
              name={"assess"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      {
                        value: "report-abnormal",
                        label:
                          "V/S's and report abnormal or pertinent findings",
                      },
                      { value: "temp", label: "Temp <95 or >100.0" },
                      { value: "pulse", label: "Pulse <50 or >110/min" },
                      { value: "resp", label: "Resp <12 or >28/min" },
                      {
                        value: "systolic",
                        label:
                          "Systolic BP <90mmHG or >160mmHG and/or diastolic BP <50 or >100mmHG",
                      },
                      {
                        value: "report-fasting",
                        label: "Report Fasting BS > 300; or < 70 mg/dl",
                      },
                      {
                        value: "report-random",
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
                  <Input
                    disabled={
                      !methods
                        .watch("instructSettings")
                        ?.includes("accept-orders")
                    }
                    {...field}
                    value={field.value as string}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"snPtToAssess"}
              render={({ field }) => (
                <FormRender label={"SN/PT to Assess (include parameters):"}>
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">VENIPUNCTURE/LAB ORDERS</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"isSnToObtain"}
            render={({ field }) => (
              <FormRender>
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">SN to obtain</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"perVenipuncture"}
            render={({ field }) => (
              <FormRender label="Per venipuncture or micro-coagulation unit:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"perFingerStick"}
            render={({ field }) => (
              <FormRender label="Per finger stick for PT/INR q (frequency):">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"venipunctureSnPtToTeach"}
            render={({ field }) => (
              <FormRender label="SN/PT to Teach/Perform: (narrative)">
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">NEUROLOGICAL ORDERS</FormHeader>
        <div className="grid gap-5 lg:grid-cols-2">
          <FormField
            control={methods.control}
            name={"knowledgeDeficits"}
            render={({ field }) => (
              <FormRender>
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">
                    SN to assess/instruct pt/cg on knowledge deficits in s/sx or
                    management of:
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
                <Input
                  disabled={!methods.watch("knowledgeDeficits")}
                  {...field}
                  value={field.value as string}
                />
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
    </>
  );
};

export default AdvancedDirective;
