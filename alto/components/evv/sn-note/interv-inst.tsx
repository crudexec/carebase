import { zodResolver } from "@hookform/resolvers/zod";
import { NoteIntervInst, User } from "@prisma/client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  FormField,
  FormRender,
  Input,
  MultiSelect,
  Textarea,
} from "@/components/ui";
import { usePopulateForm, useSaveIntervInst } from "@/hooks";
import {
  intervInstDefaultValue,
  IntervInstForm,
  noteIntervInstSchema,
} from "@/schema";

const IntervInst = ({
  caregiver,
  unscheduledVisitId,
  skilledNursingNoteId,
  patientId,
  snNoteType,
  callback,
  data,
  disabled,
}: {
  patientId: string;
  unscheduledVisitId?: string;
  skilledNursingNoteId?: string;
  snNoteType: string;
  caregiver?: User;
  callback: (skilledNursingNote?: string) => void;
  data: NoteIntervInst;
  disabled?: boolean;
}) => {
  const methods = useForm<IntervInstForm>({
    resolver: zodResolver(noteIntervInstSchema),
    defaultValues: intervInstDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: response, trigger, isMutating } = useSaveIntervInst();

  useEffect(() => {
    if (response?.success) {
      toast.success("Intervention detail saved successfully!");
      callback(response?.data?.skilledNursingNoteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  usePopulateForm<IntervInstForm, NoteIntervInst>(
    methods.reset,
    data as NoteIntervInst,
  );

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            ...formData,
            id: data?.id as string,
            unscheduledVisitId,
            skilledNursingNoteId,
            caregiverId: caregiver?.id,
            patientId,
            snNoteType,
          });
        })}
      >
        <div>
          <div className="flex justify-end text-end mt-2">
            <Button className="px-6" loading={isMutating} disabled={disabled}>
              Save Changes
            </Button>
          </div>
          <FormHeader className="mt-4">Interventions</FormHeader>
          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={"interventions"}
              render={() => (
                <FormRender formClassName="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      {
                        value: "skilled-observation",
                        label: "Skilled observation and assessment",
                      },
                      { value: "observe-adls", label: "Observe ADLs" },
                      {
                        value: "diabetic-observation",
                        label: "Diabetic Observation",
                      },
                      {
                        value: "tracheostomy-care",
                        label: "Tracheostomy Care",
                      },
                      { value: "foley-care", label: "Foley Care" },
                      { value: "wound-care", label: "Wound Care" },
                      { value: "decubitus-care", label: "Decubitus Care" },
                      { value: "colostomy-care", label: "Colostomy Care" },
                      {
                        value: "post-cataract-care",
                        label: "Post Cataract Care",
                      },
                      {
                        value: "digital-rectal",
                        label: "Digital Rectal Exam and Manual Removal",
                      },
                      { value: "enema", label: "Enema" },
                      {
                        value: "nasogastric-tube-change",
                        label: "Nasogastric tube change",
                      },
                      { value: "urine-testing", label: "Urine Testing" },
                      { value: "iv-insertion", label: "IV Insertion" },
                      { value: "im-injection", label: "IM Injection" },
                      {
                        value: "inhalation-treatment",
                        label: "Inhalation Treatment",
                      },
                      {
                        value: "medication-administration",
                        label: "Medication Administration",
                      },
                      { value: "lab-draw", label: "Lab Draw" },
                    ]}
                    name={"interventions"}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={`interventionNote`}
              render={({ field }) => (
                <FormRender label={"Intervention Note"}>
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
          </div>
        </div>
        <div>
          <FormHeader className="mt-4">Instructions/Teachings</FormHeader>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <p className="text-sm font-semibold pb-2">Cardiac</p>
              <div className="flex flex-col lg:flex-row gap-5 justify-between">
                <FormField
                  control={methods.control}
                  name={"cardiacFluid"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={disabled}
                        />
                        <span className="text-sm">S/S Fluid Retention</span>
                      </div>
                    </FormRender>
                  )}
                />
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <FormField
                    control={methods.control}
                    name={"cardiacExacerbation"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={disabled}
                          />
                          <span className="text-sm">
                            S/S of exacerbation and actions to take
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"cardiacExacerbationNote"}
                    render={({ field }) => (
                      <FormRender formClassName="flex-1">
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            !methods.watch("cardiacExacerbation") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <FormField
                    control={methods.control}
                    name={"cardiacDietTeaching"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={disabled}
                          />
                          <span className="text-sm">Diet Teaching</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"cardiacDietTeachingNote"}
                    render={({ field }) => (
                      <FormRender formClassName="flex-1">
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            !methods.watch("cardiacDietTeaching") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>

            <FormField
              control={methods.control}
              name={"respiratory"}
              render={({ field }) => (
                <FormRender label={"Respiratory"}>
                  <MultiSelect
                    options={[
                      {
                        value: "respiratory-infection",
                        label: "S/S Respiratory Infection",
                      },
                      {
                        value: "inhalation-therapy",
                        label: "Inhalation Therapy",
                      },
                    ]}
                    value={field.value as string[]}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    placeholder="Select Options"
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"gigu"}
              render={({ field }) => (
                <FormRender label={"GI/GU"}>
                  <MultiSelect
                    options={[
                      {
                        value: "foley-cathether",
                        label: "Care of Foley Cathether",
                      },
                      { value: "uti-prevention", label: "UTI Prevention" },
                      { value: "ostomy-care", label: "Ostomy Care" },
                      {
                        value: "constipation-management",
                        label: "Constipation Management",
                      },
                      {
                        value: "feeding-tube",
                        label: "Feeding Tube Management",
                      },
                    ]}
                    value={field.value as string[]}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    placeholder="Select Options"
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"endocrine"}
              render={({ field }) => (
                <FormRender label={"Endocrine"}>
                  <MultiSelect
                    options={[
                      {
                        value: "diabetic-teaching",
                        label: "Diabetic Teaching",
                      },
                      { value: "insulin-teaching", label: "Insulin Teaching" },
                      {
                        value: "hyperglycemia",
                        label: "S/S of Hypo/Hyperglycemia and actions to take",
                      },
                      {
                        value: "infection",
                        label: "S/S of Infection/Prevention",
                      },
                      {
                        value: "site-rotation",
                        label: "Injection site rotation",
                      },
                      {
                        value: "self-glucose",
                        label: "Self Glucose monitoring",
                      },
                      {
                        value: "diabetic-safety",
                        label: "Diabetic Safety issues",
                      },
                      { value: "skin-care", label: "Skin/Foot care regimen" },
                      { value: "diet-teaching", label: "Diet Teaching" },
                    ]}
                    value={field.value as string[]}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    placeholder="Select Options"
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"endocrineDietTeaching"}
              render={({ field }) => (
                <FormRender label="Diet Teaching">
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={
                      !methods.watch("endocrine").includes("diet-teaching") ||
                      disabled
                    }
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"integumentary"}
              render={({ field }) => (
                <FormRender label={"Integumentary"}>
                  <MultiSelect
                    options={[
                      {
                        value: "wound-infection",
                        label: "S/S Wound Infection/Prevention",
                      },
                      {
                        value: "decrease-pressure",
                        label: "Measures to decrease Pressure Points",
                      },
                    ]}
                    value={field.value as string[]}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    placeholder="Select Options"
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"pain"}
              render={({ field }) => (
                <FormRender label={"Pain"}>
                  <MultiSelect
                    options={[
                      {
                        value: "alternative-method",
                        label: "Alternative Methods for Pain Control",
                      },
                      {
                        value: "pain-control",
                        label: "Pain control measures/Scale",
                      },
                      {
                        value: "pain-medication",
                        label: "Importance to comply with Pain Medications",
                      },
                      { value: "pain-management", label: "Pain Management" },
                    ]}
                    value={field.value as string[]}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    placeholder="Select Options"
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"safety"}
              render={({ field }) => (
                <FormRender label={"Safety"}>
                  <MultiSelect
                    options={[
                      {
                        value: "drug-interactions",
                        label: "Drug/Drug Interactions",
                      },
                      {
                        value: "medication-safety",
                        label: "Medication Safety",
                      },
                      {
                        value: "infection-control",
                        label: "Infection Control",
                      },
                      {
                        value: "universal-precautions",
                        label: "Universal Precautions",
                      },
                      { value: "home-safety", label: "Home Safety" },
                      {
                        value: "fall-precautions",
                        label: "Fall Precautions/Transfer Safety",
                      },
                      { value: "oxygen-use", label: "Oxygen use/Safety" },
                      { value: "emergency", label: "Emergency (911 info)" },
                      {
                        value: "anticoagulant-precautions",
                        label: "Anticoagulant Precautions",
                      },
                      {
                        value: "emergency-preparedness",
                        label: "Emergency Preparedness plan",
                      },
                      {
                        value: "proper-disposal",
                        label: "Proper Disposal of Sharps",
                      },
                      {
                        value: "control-measures",
                        label: "Infection Control measures",
                      },
                      {
                        value: "disease-management",
                        label: "Disease Management",
                      },
                    ]}
                    value={field.value as string[]}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    placeholder="Select Options"
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"safetyDiseaseManagement"}
              render={({ field }) => (
                <FormRender label="Disease Management">
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={
                      !methods.watch("safety").includes("disease-management") ||
                      disabled
                    }
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={`interactionResponse`}
              render={({ field }) => (
                <FormRender label={"Patient/Caregiver Interaction Response"}>
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={`instructionsNote`}
              render={({ field }) => (
                <FormRender label={"Instructions Note"}>
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
          </div>
        </div>
        <div>
          <FormHeader className="mt-4">Progress Towards Goals</FormHeader>
          <FormField
            control={methods.control}
            name={`goals`}
            render={({ field }) => (
              <FormRender>
                <Textarea
                  {...field}
                  value={field.value as string}
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
        </div>
        <div className="flex justify-end text-end my-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default IntervInst;
