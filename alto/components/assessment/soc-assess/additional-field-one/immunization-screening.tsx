import React from "react";

import FormHeader from "@/components/form-header";
import {
  DateInput,
  FormField,
  FormRender,
  Input,
  RadioInput,
} from "@/components/ui";
import { additionalFieldOneSchema } from "@/schema/assessment/soc-assess/addtional-field-one";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldOneSchema>;

const ImmunizationScreening = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">IMMUNIZATIONS</FormHeader>
        <div className="grid gap-5">
          <div>
            <p className="text-sm font-semibold lg:col-span-2">Influenza</p>
            <div className="grid lg:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"influenzaDateReceived"}
                render={({ field }) => (
                  <FormRender label={"Date Received:"} className="!font-normal">
                    <DateInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"influenzaWhereReceived"}
                render={({ field }) => (
                  <FormRender
                    label="Who or Where Received:"
                    className="!font-normal"
                  >
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold lg:col-span-2">Pneumonia</p>
            <div className="grid lg:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"pneumoniaDateReceived"}
                render={({ field }) => (
                  <FormRender label={"Date Received:"} className="!font-normal">
                    <DateInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"pneumoniaWhereReceived"}
                render={({ field }) => (
                  <FormRender
                    label="Who or Where Received:"
                    className="!font-normal"
                  >
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold lg:col-span-2">TD</p>
            <div className="grid lg:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"tdDateReceived"}
                render={({ field }) => (
                  <FormRender label={"Date Received:"} className="!font-normal">
                    <DateInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"tdWhereReceived"}
                render={({ field }) => (
                  <FormRender
                    label="Who or Where Received:"
                    className="!font-normal"
                  >
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold lg:col-span-2">Other</p>
            <div className="grid lg:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"otherDateReceived"}
                render={({ field }) => (
                  <FormRender label={"Date Received:"} className="!font-normal">
                    <DateInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"otherWhereReceived"}
                render={({ field }) => (
                  <FormRender
                    label="Who or Where Received:"
                    className="!font-normal"
                  >
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <FormHeader className="mt-4">SCREENINGS</FormHeader>
        <div className="grid gap-5">
          <div className="grid lg:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"cholesterol"}
              render={({ field }) => (
                <FormRender label="Cholesterol?">
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
              name={"cholesterolWhereReceived"}
              render={({ field }) => (
                <FormRender label="Who or Where Received:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"mammogram"}
              render={({ field }) => (
                <FormRender label="Mammogram?">
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
              name={"mammogramWhereReceived"}
              render={({ field }) => (
                <FormRender label="Who or Where Received:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"colonCancer"}
              render={({ field }) => (
                <FormRender label="Colon Cancer?">
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
              name={"colonCancerWhereReceived"}
              render={({ field }) => (
                <FormRender label="Who or Where Received:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"prostateCancer"}
              render={({ field }) => (
                <FormRender label="Prostate Cancer?">
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
              name={"prostateCancerWhereReceived"}
              render={({ field }) => (
                <FormRender label="Who or Where Received:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>{" "}
          <div className="grid lg:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"cervicalCancer"}
              render={({ field }) => (
                <FormRender label="Cervical Cancer?">
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
              name={"cervicalCancerWhereReceived"}
              render={({ field }) => (
                <FormRender label="Who or Where Received:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>{" "}
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">SELF EXAM FREQUENCY</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"breast"}
            render={({ field }) => (
              <FormRender label="Breast:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"testicular"}
            render={({ field }) => (
              <FormRender label="Testicular:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherSelfExamFrequency"}
            render={({ field }) => (
              <FormRender label="Other:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>

      <div>
        <FormHeader className="mt-4">SELF EXAM FREQUENCY</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"patientReadyToLearn"}
            render={({ field }) => (
              <FormRender label="Ready to learn? (Patient)">
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
            name={"caregiverReadyToLearn"}
            render={({ field }) => (
              <FormRender label="Ready to learn? (Caregiver)">
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
            name={"patientMotivatedToLearn"}
            render={({ field }) => (
              <FormRender label="Motivated to learn? (Patient)">
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
            name={"caregiverMotivatedToLearn"}
            render={({ field }) => (
              <FormRender label="Motivated to learn? (Caregiver)">
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
            name={"patientAbilityToLearn"}
            render={({ field }) => (
              <FormRender label="Ability to learn? (Patient)">
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
            name={"caregiverAbilityToLearn"}
            render={({ field }) => (
              <FormRender label="Ability to learn? (Caregiver)">
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
        </div>
      </div>
    </>
  );
};

export default ImmunizationScreening;
