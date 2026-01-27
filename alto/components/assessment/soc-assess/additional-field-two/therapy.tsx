import React from "react";

import { CheckboxGroup, FormField, FormRender, Input } from "@/components/ui";
import { additionalFieldTwoSchema } from "@/schema/assessment/soc-assess/additional-field-two";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldTwoSchema>;

const Therapy = ({ methods }: { methods: formType }) => {
  return (
    <div>
      <div className="grid lg:grid-cols-4 gap-5 text-center  py-2 bg-secondary items-center justify-center font-semibold">
        <p>Therapy services</p>
        <p>LOS(Length of session)</p>
        <p>Frequency</p>
        <p>Duration</p>
      </div>
      <div className="grid gap-5 py-5">
        <p className="text-lg font-semibold">Physical therapy:</p>
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Restore patient function</p>
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Perform maintenance therapy</p>
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Gait and balance training</p>
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Restore patient function</p>
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Perform maintenance therapy</p>
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
            name={"occupationalTherapyPerformMaintenanceTherapyFrequency"}
            render={({ field }) => (
              <FormRender>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"occupationalTherapyPerformMaintenanceTherapyDuration"}
            render={({ field }) => (
              <FormRender>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Gait and balance training</p>
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
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
        <p className="text-lg font-semibold">Speech-language pathology:</p>
        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Restore language function</p>
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Restore cognitive function</p>
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Perform maintenance therapy</p>
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

        <div className="grid lg:grid-cols-4 gap-5">
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Home health aide services</p>
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
        <div className="grid lg:grid-cols-4 gap-5">
          <p className="text-sm font-semibold">Medical social services</p>
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
  );
};

export default Therapy;
