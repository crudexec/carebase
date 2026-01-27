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

const CardiacOrders = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">CARDIAC ORDERS</FormHeader>
        <div className="grid gap-5">
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
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">DIABETIC ORDERS</FormHeader>
        <div className="grid gap-5">
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
                      label: "SN to instruct pt/cg on proper foot care",
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
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">CARDIAC ORDERS</FormHeader>
        <div className="grid gap-5">
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
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">RESPIRATORY ORDERS</FormHeader>
        <div className="grid gap-5">
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
                <Input
                  disabled={
                    !methods
                      .watch("respiratoryOrders")
                      ?.includes("dressing-change")
                  }
                  {...field}
                  value={field.value as string}
                />
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
      </div>
      <div>
        <FormHeader className="mt-4">MUSCULOSKELETAL ORDERS</FormHeader>
        <div className="grid gap-5">
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
      <div>
        <FormHeader className="mt-4">BOWEL/URINARY REGIMEN ORDERS</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"bowelRegimenOrders"}
            render={() => (
              <FormRender formClassName="flex lg:col-span-2 flex-col flex-wrap gap-5 !space-y-0">
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
              <FormRender
                label={"SN/PT to Teach/Perform"}
                formClassName="lg:col-span-2"
              >
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">INTEGUMENTARY ORDERS</FormHeader>
        <div className="grid gap-5">
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
              <FormRender>
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
              <FormRender formClassName="flex flex-wrap gap-5 pl-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  disabled={!methods.watch("isSnToAccess")}
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
            for s/sx of infection or healing complications and evaluate
            effectiveness of treatment
          </p>
          <div className="grid gap-5">
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
                <Input
                  disabled={
                    !methods
                      .watch("otherIntegumentaryOrders")
                      ?.includes("caregiver-willing")
                  }
                  {...field}
                  value={field.value as string}
                />
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
    </>
  );
};

export default CardiacOrders;
