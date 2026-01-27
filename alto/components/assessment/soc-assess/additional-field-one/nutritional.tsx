import React from "react";

import FormHeader from "@/components/form-header";
import {
  CheckboxGroup,
  FormField,
  FormRender,
  Input,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { additionalFieldOneSchema } from "@/schema/assessment/soc-assess/addtional-field-one";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldOneSchema>;

const Nutritional = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4"> NUTRITIONAL ASSESSMENT</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"nutritionalDiet"}
            render={({ field }) => (
              <FormRender label="Diet">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"nutritionalDietType"}
            render={({ field }) => (
              <FormRender label="Type">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold pb-2">Enteral:</p>
            <FormField
              control={methods.control}
              name={"nutritionalDietEnternal"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    disabled={!methods.watch("over65")?.includes("YES")}
                    methods={methods}
                    options={[
                      { value: "j-tube", label: "J-tube" },
                      { value: "g-tube", label: "G-tube" },
                      { value: "continuous", label: "Continuous" },
                      { value: "intermittent", label: "Intermittent" },
                    ]}
                    name={"nutritionalDietEnternal"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"complexWound"}
            render={({ field }) => (
              <FormRender label="Complex Wounds?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"tpnTherapy"}
            render={({ field }) => (
              <FormRender label="TPN Therapy?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"impairedFoodIntake"}
            render={({ field }) => (
              <FormRender label="Impaired/inadequate food intake?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"eatLessThan2MealADay"}
            render={({ field }) => (
              <FormRender label="Eats less than 2 meals a day?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"eatFruits"}
            render={({ field }) => (
              <FormRender label="Eats few fruits, vegetables or milk products?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"swallowingProblems"}
            render={({ field }) => (
              <FormRender label="Tooth, mouth or swallowing problems?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"insufficientMoneyToBuyFood"}
            render={({ field }) => (
              <FormRender label="Insufficient money to buy food?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"eatsAlone"}
            render={({ field }) => (
              <FormRender label="Eats alone?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"takes3OrMoreMeds"}
            render={({ field }) => (
              <FormRender label="Takes 3 or more meds?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"involWeightLoss"}
            render={({ field }) => (
              <FormRender label="Invol. Weight loss/gain of 10 lbs.in past 6 months?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"totalNutritionalAssessment"}
            render={({ field }) => (
              <FormRender label="Total:">
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4"> NUTRITIONAL SCREEN</FormHeader>
        <div className="grid gap-5">
          <FormField
            control={methods.control}
            name={"nutritionalScreeen"}
            render={() => (
              <FormRender formClassName="flex flex-col flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  disabled={!methods.watch("over65")?.includes("YES")}
                  methods={methods}
                  options={[
                    {
                      value: "low-nutrition-risk",
                      label:
                        "0-5 = Low Nutrition Risk (Continue to observe for nutritional needs and intervene as necessary)",
                    },
                    {
                      value: "moderate-risk",
                      label:
                        "6-9 = Moderate Risk (Educate the patient/family/caregiver to improve eating habits and life style including consideration for patient's food preference and frequency of meals. Involve the R.D. as needed for educational materials or suggestions in improvement measures)",
                    },
                    {
                      value: "high-nutrition-risk",
                      label:
                        "10+ = High Nutrition Risk (R.N. to consult with R.D. consult with the physician, consider labs, weight changes, diet. Send written communication to the R.D. Obtain order for R.D. as needed)",
                    },
                  ]}
                  name={"nutritionalScreeen"}
                />
              </FormRender>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default Nutritional;
