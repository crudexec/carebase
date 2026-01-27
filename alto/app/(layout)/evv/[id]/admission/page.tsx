"use client";
import React, { useMemo, useState } from "react";

import AppLoader from "@/components/app-loader";
import { Shell } from "@/components/data-table";
import Detail from "@/components/detail";
import { Admission, Discipline, Frequency, Others } from "@/components/evv";
import { SegmentedControl, TabsContent } from "@/components/ui";
import { useGetPatient } from "@/hooks";
import { formatDate, modifyDateFields } from "@/lib";
import {
  PageProps,
  PatientReferralSourceResponse,
  PatientResponse,
} from "@/types";

const PatientAdmission = ({ params: { id } }: PageProps) => {
  const [formTab, setFormTab] = useState("admission");
  const { data, isLoading, mutate } = useGetPatient({ id });

  const patientData = useMemo(() => {
    if (data?.data) {
      const parsedData = {
        ...data?.data,
        admitDate: data?.data?.patientAdmission?.[0]?.createdAt,
        dischargeDate: data?.data?.patientAdmission?.[0]?.createdAt,
        reason: data?.data?.patientAdmission?.[0]?.reason,
        otherReason: data?.data?.patientAdmission?.[0]?.otherReason,
        status: data?.data?.patientAdmission?.[0]?.status,
        admissionId: data?.data?.patientAdmission?.[0]?.id,
        ...(data?.data?.physician && {
          physician: {
            id: data?.data?.physician?.id,
            npi: data?.data?.physician?.npi,
          },
        }),
      };
      return modifyDateFields({
        ...parsedData,
        patientReferralSource: modifyDateFields(
          parsedData.patientReferralSource as PatientReferralSourceResponse,
        ),
      });
    } else return data?.data;
  }, [data]);

  return (
    <Shell>
      <AppLoader loading={isLoading} />
      <SegmentedControl
        data={[
          { value: "admission", label: "Admission" },
          { value: "discipline", label: "Disciplines" },
          { value: "frequency", label: "Frequency" },
          { value: "other", label: "Other" },
        ]}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <div className="border p-4 rounded flex flex-col">
          <div>
            <p className="text-2xl pb-2 font-semibold uppercase">
              {patientData?.firstName}, {patientData?.lastName}
            </p>
            <div className="bg-secondary flex flex-col border">
              <div className="p-2">
                <Detail title="DOB" detail={formatDate(patientData?.dob)} />
              </div>
            </div>
          </div>
          <TabsContent value="admission">
            <Admission data={patientData as PatientResponse} mutate={mutate} />
          </TabsContent>
          <TabsContent value="discipline">
            <Discipline patient={patientData as PatientResponse} />
          </TabsContent>
          <TabsContent value="frequency">
            <Frequency patientId={id} />
          </TabsContent>
          <TabsContent value="other">
            <Others patientId={id} />
          </TabsContent>
        </div>
      </SegmentedControl>
    </Shell>
  );
};

export default PatientAdmission;
