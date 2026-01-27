"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import useSWRMutation from "swr/mutation";

import { Button, Form } from "@/components/ui";
import {
  useCreatePatientMedication,
  useUpdatePatientMedication,
} from "@/hooks";
import { cn, filterArray, pickValues } from "@/lib";
import {
  medicationDefaultValue,
  medicationFormSchema,
  PatientMedicationForm,
} from "@/schema";
import { FormReturn, ISetState } from "@/types";

import ActivititesAndDiets from "../medication/activities-and-diet";
import ContactInformation from "../medication/contact-information";
import CurrentMedication from "../medication/current";
import FoleyCatheter from "../medication/foley-catheter";
import FormSection from "../medication/form-section";
import FunctionalLimits from "../medication/functional-limits";
import Medicare from "../medication/medicare";
import NurseInformation from "../medication/nurse-information";
import PertinentDiagnosis from "../medication/pertinent-diagnosis";
import PriorEpisode from "../medication/prior-episode";
import ServicesRequested from "../medication/services-requested";
import UlcerHistory from "../medication/ulcer-history";
import Vaccines from "../medication/vaccines";

type formType = FormReturn<typeof medicationFormSchema>;

const CreateMedication = ({
  refreshTable,
  onClose,
  mode,
  selected,
  patientId,
  setTab,
  methods,
}: {
  refreshTable: () => void;
  onClose: () => void;
  mode: "create" | "edit" | "view";
  selected?: PatientMedicationForm & { id: string };
  patientId: string;
  setTab: ISetState<string>;
  methods: formType;
}) => {
  const [medicationId, setMedicationId] = useState("");

  const { data, trigger, isMutating } = useSWRMutation(
    "/api/patient/medication",
    useCreatePatientMedication,
  );
  const {
    data: updateResponse,
    trigger: updatePatientMedication,
    isMutating: isUpdating,
  } = useSWRMutation("/api/patient/medication", useUpdatePatientMedication);

  const modalClose = () => {
    methods.reset(medicationDefaultValue);
    setMedicationId("");
    onClose();
  };

  useEffect(() => {
    if (data?.success || updateResponse?.success) {
      refreshTable();
      if (
        (mode === "create" && !medicationId) ||
        (!selected?.id && patientId)
      ) {
        toast.success(`Success|${data?.message}`);
      } else {
        toast.success(`Success|${updateResponse?.message}`);
      }
      setMedicationId(data?.data?.id);
      modalClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateResponse]);

  return (
    <Form {...methods}>
      <form
        className="h-[670px] overflow-auto mt-2 justify-between flex flex-col scrollbar-hide"
        onSubmit={methods.handleSubmit(async (data) => {
          const filteredData = {
            ...data,
            primaryDx: pickValues(data.primaryDx),
            MIO12InpatientProcedure: filterArray(data.MIO12InpatientProcedure),
            serviceRequested: filterArray(data.serviceRequested),
            medication: filterArray(data.medication),
            otherDx: filterArray(data.otherDx),
            functionLimits: data.functionLimits?.length
              ? data.functionLimits
              : undefined,
            activitiesAndDiet: data.activitiesAndDiet?.length
              ? data.activitiesAndDiet
              : undefined,
            patientId,
          };

          if (
            (mode === "create" && !medicationId) ||
            (!selected?.id && !!patientId)
          ) {
            await trigger(pickValues(filteredData));
          } else {
            await updatePatientMedication({
              ...filteredData,
              primaryDx: data.primaryDx,
              id: selected?.id as string,
            });
          }
        })}
      >
        {/* Current Medication*/}
        <FormSection title="Current Medication" className="z-[1] mt-4">
          <CurrentMedication methods={methods} mode={mode} />
        </FormSection>

        {/* Pertinent Diagnosis */}
        <FormSection title="Pertinent Diagnosis" className="z-[2]">
          <PertinentDiagnosis methods={methods} mode={mode} />
        </FormSection>

        {/* Ulcer History */}
        <FormSection title="Ulcer History" className="z-[3]">
          <UlcerHistory methods={methods} mode={mode} />
        </FormSection>

        {/* Functional Limits */}
        <FormSection title="Functional Limits" className="z-[3]">
          <FunctionalLimits methods={methods} mode={mode} />
        </FormSection>

        {/* Activities and Diets */}
        <FormSection title="Activities and Diets" className="z-[4]">
          <ActivititesAndDiets methods={methods} mode={mode} />
        </FormSection>

        {/* Vaccines */}
        <FormSection title="Vaccines" className="z-[5]">
          <Vaccines methods={methods} mode={mode} />
        </FormSection>

        {/* Foley Catheter */}
        <FormSection title="Foley Catheter" className="z-[6]">
          <FoleyCatheter methods={methods} mode={mode} />
        </FormSection>

        {/* Services Requested */}
        <FormSection title="Services Requested" className="z-[7]">
          <ServicesRequested methods={methods} mode={mode} />
        </FormSection>

        {/* Contact Information */}
        <FormSection title="Contact Information" className="z-[8]">
          <ContactInformation methods={methods} mode={mode} />
        </FormSection>

        {/* Nurse Information */}
        <FormSection title="Nurse Information" className="z-[9]">
          <NurseInformation methods={methods} mode={mode} />
        </FormSection>

        {/* Medicare */}
        <FormSection title="Medicare" className="z-[10]">
          <Medicare methods={methods} mode={mode} />
        </FormSection>

        {/* Prior Episode */}
        <FormSection title="Prior Episode Exist" className="z-[11]">
          <PriorEpisode methods={methods} mode={mode} />
        </FormSection>

        {mode !== "view" && (
          <div className={cn("flex gap-2 items-center w-full px-8")}>
            <Button
              leftIcon={<FaArrowLeft />}
              type="button"
              className="md:mx-2 mt-6 py-2 text-white w-[50%]"
              onClick={() => setTab("general-information")}
            >
              Prev
            </Button>
            <Button
              rightIcon={<FaArrowRight />}
              type="submit"
              className={cn("md:mx-2 mt-6 py-2 text-white w-[50%]")}
              loading={isMutating || isUpdating}
            >
              Submit
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default CreateMedication;
