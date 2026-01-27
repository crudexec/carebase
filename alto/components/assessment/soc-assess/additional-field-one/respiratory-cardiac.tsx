import { isEmpty } from "lodash";
import React from "react";

import FormHeader from "@/components/form-header";
import {
  CheckboxGroup,
  DateInput,
  FormField,
  FormRender,
  Input,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { additionalFieldOneSchema } from "@/schema/assessment/soc-assess/addtional-field-one";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldOneSchema>;

const RespiratoryCardiac = ({ methods }: { methods: formType }) => {
  return (
    <>
      {" "}
      <div>
        <FormHeader className="mt-4">RESPIRATORY STATUS</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"useOfAccessoryMuscle"}
            render={({ field }) => (
              <FormRender label="Use of accessory muscle?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"orthopnea"}
            render={({ field }) => (
              <FormRender label="Orthopnea?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"cough"}
            render={({ field }) => (
              <FormRender label="Cough?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"describeCough"}
            render={({ field }) => (
              <FormRender label="Describe">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={!methods.watch("cough")?.includes("YES")}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"sputum"}
            render={({ field }) => (
              <FormRender label="Sputum?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"describeSputum"}
            render={({ field }) => (
              <FormRender label="Describe">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={!methods.watch("sputum")?.includes("YES")}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"abnormalBreathSound"}
            render={({ field }) => (
              <FormRender label="Abnormal breath sound?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"respiratoryStatusWheezes"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "wheezes", label: "Wheezes" },
                    { value: "diminished", label: "Diminished" },
                    { value: "absent", label: "Absent" },
                  ]}
                  name={"respiratoryStatusWheezes"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"respiratoryStatusCrackles"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "crackles", label: "Crackles" },
                    { value: "rales", label: "Rales" },
                    { value: "rhonchi", label: "Rhonchi" },
                    { value: "other", label: "Other" },
                  ]}
                  name={"respiratoryStatusCrackles"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherRespiratoryStatusCrackles"}
            render={({ field }) => (
              <FormRender label="Other:">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={
                    !methods
                      .watch("respiratoryStatusCrackles")
                      ?.includes("other")
                  }
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"cyanosis"}
            render={({ field }) => (
              <FormRender label="Cyanosis or pain?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"describeCyanosis"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={!methods.watch("cyanosis")?.includes("YES")}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"useOfO2"}
            render={({ field }) => (
              <FormRender label="Use of O2 at:">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"o2value"}
            render={({ field }) => (
              <FormRender label="O2 Value:">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={!methods.watch("useOfO2")?.includes("YES")}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"respiratoryStatusVia"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0 lg:col-span-2">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "nasal-cannula", label: "Nasal Cannula" },
                    { value: "mask", label: "Mask" },
                    { value: "continous", label: "Continous" },
                    { value: "HS", label: "HS" },
                    { value: "PRN", label: "PRN" },
                  ]}
                  name={"respiratoryStatusVia"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"sleepApnea"}
            render={({ field }) => (
              <FormRender label="Sleep apnea?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"nocturnalDyspnea"}
            render={({ field }) => (
              <FormRender label="Nocturnal dyspnea?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"useOfEquipment"}
            render={({ field }) => (
              <FormRender label="Use of equipment?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"specifyUseOfEquipment"}
            render={({ field }) => (
              <FormRender label="Specify:">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={!methods.watch("useOfEquipment")?.includes("YES")}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"tracheostomy"}
            render={({ field }) => (
              <FormRender label="Tracheostomy?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"tracheostomySize"}
            render={({ field }) => (
              <FormRender label="Size:">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={!methods.watch("tracheostomy")?.includes("YES")}
                />
              </FormRender>
            )}
          />

          <div>
            <p className="text-sm pb-2 font-semibold">Managed By</p>
            <FormField
              control={methods.control}
              name={"managedBy"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                    ]}
                    name={"managedBy"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"managedByName"}
            render={({ field }) => (
              <FormRender label="Name:">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={isEmpty(methods.watch("managedBy"))}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"respiratoryStatusDocumentation"}
            render={({ field }) => (
              <FormRender
                label="Supporting Documentation:"
                formClassName="lg:col-span-2"
              >
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">CARDIAC STATUS</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"chestPain"}
            render={({ field }) => (
              <FormRender label="Chest pain?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"describeChestPain"}
            render={({ field }) => (
              <FormRender label="Describe">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={!methods.watch("chestPain")?.includes("YES")}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"abnormalHeartSound"}
            render={({ field }) => (
              <FormRender label="Abnormal heart sounds?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"describeAbnormalHeartSound"}
            render={({ field }) => (
              <FormRender label="Describe">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={
                    !methods.watch("abnormalHeartSound")?.includes("YES")
                  }
                />
              </FormRender>
            )}
          />
          <div className="lg:col-span-2 grid lg:grid-cols-3 gap-5">
            <FormField
              control={methods.control}
              name={"pacemaker"}
              render={({ field }) => (
                <FormRender label="Pacemaker?">
                  <RadioInput
                    className="flex-row gap-3 items-start"
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
              name={`pacemakerDate`}
              render={({ field }) => (
                <FormRender label="Date Inserted">
                  <DateInput
                    {...field}
                    value={field.value as Date}
                    disabled={!methods.watch("pacemaker")?.includes("YES")}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"pacemakerRate"}
              render={({ field }) => (
                <FormRender label="Rate">
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={!methods.watch("pacemaker")?.includes("YES")}
                  />
                </FormRender>
              )}
            />
          </div>
          <div className="lg:col-span-2 grid lg:grid-cols-3 gap-5">
            <FormField
              control={methods.control}
              name={"absentPulse"}
              render={({ field }) => (
                <FormRender label="Faint or absent pulse?">
                  <RadioInput
                    className="flex-row gap-3 items-start"
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
              name={"specifyAbsentPulse"}
              render={({ field }) => (
                <FormRender label="Specify">
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={!methods.watch("absentPulse")?.includes("YES")}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"absentPulseVolume"}
              render={({ field }) => (
                <FormRender label="Volume">
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={!methods.watch("absentPulse")?.includes("YES")}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"edema"}
            render={({ field }) => (
              <FormRender label="Edema?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"describeEdema"}
            render={({ field }) => (
              <FormRender label="Describe">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={!methods.watch("edema")?.includes("YES")}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"faintingDizzness"}
            render={({ field }) => (
              <FormRender label="Fainting/dizzines?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"palpitations"}
            render={({ field }) => (
              <FormRender label="Palpitations?">
                <RadioInput
                  className="flex-row gap-3 items-start"
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
            name={"cardiacStatusDocumentation"}
            render={({ field }) => (
              <FormRender
                label="Supporting Documentation:"
                formClassName="lg:col-span-2"
              >
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default RespiratoryCardiac;
