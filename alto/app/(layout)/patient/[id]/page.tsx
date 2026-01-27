"use client";

import {
  InsuranceSectionType,
  PatientAuthorization,
  PatientCommercial,
  PatientEmergencyContact,
  PatientInsurance,
} from "@prisma/client";
import { useRouter } from "next-nprogress-bar";
import React, { useMemo, useState } from "react";
import { ImSpinner8 } from "react-icons/im";

import AppLoader from "@/components/app-loader";
import {
  AccessInformation,
  Authorization,
  Commercial,
  EmergencyContact,
  Insurance,
  Log as PatientLog,
  ProfileAdmission,
  ReferralSource,
  Sidebar,
} from "@/components/patient";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Burger,
  SegmentedControl,
} from "@/components/ui";
import { patientProfileTabs } from "@/constants";
import { useGetPatient } from "@/hooks";
import { useGetLogs } from "@/hooks/request/patient/log";
import { formatDate, modifyDateFields } from "@/lib";
import {
  AuthorizationDefaultValue,
  PatientInsuranceForm,
  referralSourceDefaultValue,
} from "@/schema";
import {
  PageProps,
  PatientAccessInfoResponse,
  PatientReferralSourceResponse,
} from "@/types";

const PatientProfile = ({ params: { id } }: PageProps) => {
  const { data, isLoading, mutate } = useGetPatient({ id });
  const { data: logs, isLoading: logLoading } = useGetLogs({ id });
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("admission");
  const [open, setOpen] = useState(false);
  const toggleNav = () => {
    setOpen(!open);
  };

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
      <div className="bg-secondary sticky top-0 z-20">
        <div className="px-4 pb-2 pt-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {!isLoading ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={""} alt="patient-profile" />
                {(patientData?.firstName || patientData?.lastName) && (
                  <AvatarFallback className="bg-primary text-primary-foreground uppercase">{`${patientData?.firstName?.charAt(0)}${patientData?.lastName?.charAt(0)}`}</AvatarFallback>
                )}
              </Avatar>
            ) : (
              <Avatar className="h-12 w-12 items-center justify-center place-items-center bg-border/60">
                <ImSpinner8 className="animate-spin" />
              </Avatar>
            )}
            <p className="text-base font-medium">
              {patientData?.firstName} {patientData?.lastName}
            </p>
          </div>
          <Burger
            toggleNav={toggleNav}
            opened={open}
            className="block lg:hidden"
          />
        </div>
        <SegmentedControl
          data={patientProfileTabs}
          value={activeTab}
          transparent
          className="mx-auto lg:flex justify-end rounded-none px-0 hidden"
          onChange={(value) => {
            router.push(`/patient/${id}?tab=${value}`);
            setActiveTab(value);
          }}
        />
        <Sidebar open={open} setOpen={setOpen} onClick={setActiveTab} />
      </div>
      {
        {
          admission: (
            <div className="relative">
              <AppLoader loading={isLoading} />
              <ProfileAdmission data={patientData} mutate={mutate} />
            </div>
          ),
          referral_source: (
            <div className="relative">
              <AppLoader loading={isLoading} />{" "}
              <ReferralSource
                patientId={patientData?.id}
                data={
                  {
                    ...patientData?.patientReferralSource,
                    pharmacy: patientData?.patientReferralSource?.pharmacy
                      .length
                      ? patientData?.patientReferralSource?.pharmacy
                      : referralSourceDefaultValue.pharmacy[0],
                  } as PatientReferralSourceResponse
                }
                mutate={mutate}
              />
            </div>
          ),
          emergency_contact: (
            <div className="relative">
              <AppLoader loading={isLoading} />{" "}
              <EmergencyContact
                patientId={patientData?.id}
                data={
                  patientData?.patientEmergencyContact as PatientEmergencyContact
                }
                mutate={mutate}
              />
            </div>
          ),
          insurance: (
            <div className="relative">
              <AppLoader loading={isLoading} />
              <Insurance
                patientId={patientData?.id}
                data={{
                  ...(getInsuranceData(
                    patientData?.patientInsurance as PatientInsurance[],
                  ) as PatientInsuranceForm),
                }}
                mutate={mutate}
              />
            </div>
          ),
          commercial: (
            <div className="relative">
              <AppLoader loading={isLoading} />
              <Commercial
                patientId={patientData?.id}
                data={
                  modifyDateFields(
                    patientData?.patientCommercial as PatientCommercial,
                  ) as PatientCommercial
                }
                mutate={mutate}
              />
            </div>
          ),
          authorization: (
            <div className="relative">
              <AppLoader loading={isLoading} />{" "}
              <Authorization
                patientId={patientData?.id}
                data={{
                  authorizationTracker: (patientData?.patientAuthorization
                    .length
                    ? patientData?.patientAuthorization.map((item) =>
                        modifyDateFields(item),
                      )
                    : AuthorizationDefaultValue.authorizationTracker) as PatientAuthorization[],
                }}
                mutate={mutate}
              />
            </div>
          ),
          log: (
            <div className="relative">
              <AppLoader loading={logLoading} />
              <PatientLog
                value={
                  logs?.data
                    ?.map(
                      (log) => `[${formatDate(log.createdAt)}]: ${log.text}`,
                    )
                    .join("; ") ?? ""
                }
              />
            </div>
          ),
          access_info: (
            <div className="relative">
              <AppLoader loading={isLoading} />{" "}
              <AccessInformation
                patientId={patientData?.id as string}
                patientAccessInfo={
                  patientData?.patientAccessInformation as PatientAccessInfoResponse
                }
                mutate={mutate}
              />
            </div>
          ),
        }[activeTab]
      }
    </div>
  );
};

export default PatientProfile;
