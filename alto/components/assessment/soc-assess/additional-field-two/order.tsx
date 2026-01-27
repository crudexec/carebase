import React from "react";

import { FormField, FormRender, Input, Textarea } from "@/components/ui";
import { additionalFieldTwoSchema } from "@/schema/assessment/soc-assess/additional-field-two";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldTwoSchema>;

const Order = ({ methods }: { methods: formType }) => {
  return (
    <div>
      <div className="grid lg:grid-cols-4 gap-5 text-center mt-4 py-2 bg-secondary items-center justify-center font-semibold">
        <p>Orders</p>
        <p>LOS(Length of session)</p>
        <p>Frequency</p>
        <p>Duration</p>
      </div>
      <div className="grid gap-5 py-5">
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Administration of medications</p>
          <FormField
            control={methods.control}
            name={"administrationOfMedicationsLos"}
            render={({ field }) => (
              <FormRender>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"administrationOfMedicationsFrequency"}
            render={({ field }) => (
              <FormRender>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"administrationOfMedicationsDuration"}
            render={({ field }) => (
              <FormRender>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Complex care plan management</p>
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Rehabilitation nursing</p>
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
        <div className="grid lg:grid-cols-4 gap-5">
          <FormField
            control={methods.control}
            name={"otherTitle"}
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
  );
};

export default Order;
