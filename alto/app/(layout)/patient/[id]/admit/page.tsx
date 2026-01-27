"use client";
import {
  InsuranceSectionType,
  PatientInsurance,
  PatientPolicyHolder,
} from "@prisma/client";
import { useRouter } from "next-nprogress-bar";
import React, { useMemo, useState } from "react";

import AppLoader from "@/components/app-loader";
import {
  AdmitPatient,
  PolicyHolder,
  ProfileTopNav,
} from "@/components/patient";
import { useGetPatient } from "@/hooks";
import { modifyDateFields } from "@/lib";
import { PatientInsuranceForm } from "@/schema";
import {
  PageProps,
  PatientReferralSourceResponse,
  PatientResponse,
} from "@/types";

const AdmitPatientPage = ({ params: { id }, searchParams }: PageProps) => {
  const router = useRouter();
  const { data, isLoading, mutate } = useGetPatient({ id });
  const [activeTab, setActiveTab] = useState("admission");

  const patientData = useMemo(() => {
    if (data?.data) {
      const parsedData = {
        ...data?.data,
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
        patientPolicyHolder: modifyDateFields(
          parsedData.patientPolicyHolder as PatientPolicyHolder,
        ),
      });
    } else return data?.data;
  }, [data]);

  const getInsuranceData = (data: PatientInsurance[]) => {
    const convertedData = {} as Record<
      InsuranceSectionType,
      Omit<PatientInsurance, "type">
    >;

    if (data) {
      for (const item of data) {
        const { type, ...rest } = item;
        if (type) {
          convertedData[type] = rest;
        }
      }
      return convertedData;
    } else {
      return data;
    }
  };

  return (
    <div>
      <ProfileTopNav
        payer={searchParams?.payer as string}
        setActiveTab={(value) => {
          router.push(
            `/patient/${id}/admit?tab=${value}&payer=${searchParams?.payer}`,
          );
          setActiveTab(value);
        }}
        activeTab={activeTab}
        patient={{
          firstName: patientData?.firstName ?? "",
          lastName: patientData?.lastName ?? "",
          image: "",
        }}
        loading={isLoading}
      />
      {
        {
          admission: (
            <div className="relative">
              <AppLoader loading={isLoading} />
              <AdmitPatient
                payer={searchParams?.payer as string}
                data={{
                  ...(patientData as PatientResponse),
                  caregiver: patientData?.patientAccessInformation
                    ?.caregivers?.[0] as string,
                  ...(getInsuranceData(
                    patientData?.patientInsurance as PatientInsurance[],
                  ) as PatientInsuranceForm),
                }}
                mutate={mutate}
              />
            </div>
          ),
          policyHolder: (
            <div className="relative">
              <AppLoader loading={isLoading} />
              <PolicyHolder
                data={patientData?.patientPolicyHolder}
                mutate={mutate}
                patientId={id}
              />
            </div>
          ),
        }[activeTab]
      }
    </div>
  );
};

export default AdmitPatientPage;
