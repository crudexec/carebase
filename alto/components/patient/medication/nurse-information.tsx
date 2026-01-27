import { FormField, FormRender, Input } from "@/components/ui";
import { cn } from "@/lib";
import { medicationFormSchema } from "@/schema/patient/medication";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const NurseInformation = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: "create" | "edit" | "view";
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-7 gap-y-4 md:px-8 px-4 w-full",
        "lg:grid-cols-2",
      )}
    >
      <FormField
        control={methods.control}
        name={`initalIntakeNurse`}
        render={({ field }) => (
          <FormRender label={"Intake Nurse"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`initialReferral`}
        render={({ field }) => (
          <FormRender label={"Initial Referral"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`initialReferralTime`}
        render={({ field }) => (
          <FormRender label={"Time"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
              type="time"
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`finalIntakeNurse`}
        render={({ field }) => (
          <FormRender label={"Intake Nurse"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`finalReferral`}
        render={({ field }) => (
          <FormRender label={"Final Referral"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`finalReferralTime`}
        render={({ field }) => (
          <FormRender label={"Time"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
              type="time"
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`nurseComments`}
        render={({ field }) => (
          <FormRender label={"Comments"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`proposedAdmission`}
        render={({ field }) => (
          <FormRender label={"Proposed Admission"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`proposedAdmissionTime`}
        render={({ field }) => (
          <FormRender label={"Time"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
              type="time"
            />
          </FormRender>
        )}
      />
    </div>
  );
};

export default NurseInformation;
