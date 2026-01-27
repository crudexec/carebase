import React from "react";

import FormHeader from "@/components/form-header";
import {
  Checkbox,
  CheckboxGroup,
  FormField,
  FormRender,
  Input,
  Textarea,
} from "@/components/ui";
import { additionalFieldTwoSchema } from "@/schema/assessment/soc-assess/additional-field-two";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldTwoSchema>;

const RenalOrders = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">CARDIAC ORDERS</FormHeader>
        <div className="grid gap-5">
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
                <Input
                  disabled={
                    !methods.watch("renalOrders")?.includes("hickman-groshong")
                  }
                  {...field}
                  value={field.value as string}
                />
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
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">GOALS/EXPECTED OUTCOMES</FormHeader>
        <div className="grid gap-5">
          <div className="grid gap-5">
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
                    disabled={
                      !methods
                        .watch("expectedOutcomes")
                        ?.includes("knowledgeable-of")
                    }
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
                  <FormRender>
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
                      Improve nutritional status during 60 days as evidenced by:
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
                    disabled={!methods.watch("nutritionStatus")}
                    methods={methods}
                    options={[
                      { value: "weight-gain", label: "Weight Gain" },
                      { value: "no-weight-gain", label: "No Weight Gain" },
                    ]}
                    name={"weightGain"}
                  />
                </FormRender>
              )}
            />
            <div className="grid gap-5">
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
                      <Input
                        disabled={
                          !methods
                            .watch("scaleAssessment")
                            ?.includes("notify-physician")
                        }
                        {...field}
                        value={field.value as string}
                      />
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
                      <Input
                        disabled={
                          !methods
                            .watch("scaleAssessment")
                            ?.includes("notify-physician")
                        }
                        {...field}
                        value={field.value as string}
                      />
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
                  <Input
                    disabled={!methods.watch("isPtWoundSign")}
                    {...field}
                    value={field.value as string}
                  />
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
                      { value: "decreased-size", label: "Decreased Size" },
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
                      Pt/cg will be independent with wound care and management
                      as evidenced by return demo and verbalization by:
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
                  <Input
                    disabled={!methods.watch("isIndependentWithWoundCare")}
                    {...field}
                    value={field.value as string}
                  />
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
                    disabled={!methods.watch("isPt")}
                    methods={methods}
                    options={[
                      { value: "foley", label: "Foley" },
                      { value: "supra-pubic-cath", label: "Supra pubic cath" },
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
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RenalOrders;
