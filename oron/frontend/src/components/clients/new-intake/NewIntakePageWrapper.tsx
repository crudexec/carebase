"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import SideNavigation from "../../forms/SideNavigation";
import { Progress } from "@/components/ui/progress";
import { CLIENTS_FORM_SIDEBAR } from "@/constants";
import ClientInformation from "./ClientInformation";
import ReferralInformation from "./ReferralInformation";
import IntakeInformation from "./IntakeInformation";
import ServiceCordinatorInformation from "./ServiceCordinatorInformation";
import AboutParticipant from "./AboutParticipant";
import MedicalInformation from "./MedicalInformation";
import AdmissionInformation from "./AdmissionInformation";
import ContactInformation from "./ContactInformation";
import { useRouter, useSearchParams } from "next/navigation";
import {
  retrievFullIntakeForm,
  retrievEmployeeFullIntakeForm,
} from "@/use-cases/new-intake";
import useCustomQuery from "@/hooks/useCustomQuery";
import { FullIntakeType, IntakeType } from "@/types/IntakeForm";
import Loader from "@/components/Loader";
import { retrieveClientById } from "@/use-cases/clients";
import { useQuery } from "@tanstack/react-query";
import { capitalizeFirstLetter } from "@/utils";
import { formatClientStatus } from "../ClientsPageWrapper";
import FormBadge from "@/components/badge/FormBadge";
import BreadCrumb from "@/components/BreadCrumb";

const NewIntakePageWrapper = ({
  admin,
  isEditing,
  isViewing,
  clientId,
}: {
  admin?: boolean;
  isEditing?: boolean;
  isViewing?: boolean;
  clientId?: string;
}) => {
  const { data, isLoading, refetch } = useCustomQuery<
    FullIntakeType | undefined
  >(
    admin ? "fullIntake" : "employeeFullIntake",
    admin ? retrievFullIntakeForm : retrievEmployeeFullIntakeForm,
    true
  );
  const token = localStorage.getItem("token") as string;
  const {
    data: clientIntake,
    isLoading: clientIntakeLoading,
    refetch: refetchClientIntake,
  } = useQuery<FullIntakeType>({
    queryKey: ["clientDetail", clientId],
    queryFn: async () => await retrieveClientById(token, clientId!),
    enabled: !!clientId && clientId.length > 0,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const continueFromPrevIntake = searchParams.get("status");
  const intakeFullId = searchParams.get("intake_full_id");
  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const [prevSectionId, setPrevSectionId] = useState<string>("");
  const initialLatestIntakeRef = useRef<IntakeType | undefined>(undefined);

  useEffect(() => {
    refetch();
    refetchClientIntake();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, completedSections]);

  const handleChangeSectionid = (newId: string) => {
    setPrevSectionId(newId);
  };

  const handleChangeIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
    router.push("#");
  };

  const handleNewCompletedSection = useCallback(
    (newSection: number) => {
      setCompletedSections((prevSections) => {
        const uniqueSections = new Set(prevSections);
        uniqueSections.add(newSection);
        return uniqueSections;
      });
      router.push("#");
    },
    [router]
  );

  const totalSections = 8;
  const completedPercentage = Math.floor(
    (completedSections.size / totalSections) * 100
  );

  let intakeForm: IntakeType | undefined;

  if (isViewing || isEditing) {
    intakeForm = clientIntake?.data[0];
  } else {
    if (typeof data === "boolean") {
      intakeForm = undefined;
    } else if (data && "data" in data && Array.isArray(data?.data)) {
      const newIntakes = data?.data.filter(
        (item) => item.status === "new_intake"
      );

      const latestIntake = newIntakes.reduce((latest, item) => {
        return latest.status === "new_intake" &&
          new Date(item.updated_at) > new Date(latest.updated_at)
          ? item
          : latest;
      }, newIntakes[0]);

      if (initialLatestIntakeRef.current === undefined) {
        initialLatestIntakeRef.current = latestIntake;
      }

      if (
        continueFromPrevIntake &&
        continueFromPrevIntake === "continue" &&
        latestIntake
      ) {
        intakeForm = latestIntake;
      } else {
        if (intakeFullId) {
          intakeForm = data?.data?.find((intake) => intake.id === intakeFullId);
        } else if (latestIntake === initialLatestIntakeRef.current) {
          intakeForm = undefined;
        } else {
          intakeForm = latestIntake;
        }
      }
    }
  }

  useEffect(() => {
    if (intakeForm?.client_information_id) {
      setCompletedSections((prevSections) => {
        const uniqueSections = new Set(prevSections);
        uniqueSections.add(1);
        return uniqueSections;
      });
    }

    if (intakeForm?.referral_information_id) {
      setCompletedSections((prevSections) => {
        const uniqueSections = new Set(prevSections);
        uniqueSections.add(2);
        return uniqueSections;
      });
    }

    if (intakeForm?.intake_information_id) {
      setCompletedSections((prevSections) => {
        const uniqueSections = new Set(prevSections);
        uniqueSections.add(3);
        return uniqueSections;
      });
    }

    if (
      intakeForm?.mother_contact_information_id &&
      intakeForm?.father_contact_information_id &&
      intakeForm?.emergency_contact_information_id &&
      intakeForm?.school_contact_information_id
    ) {
      setCompletedSections((prevSections) => {
        const uniqueSections = new Set(prevSections);
        uniqueSections.add(4);
        return uniqueSections;
      });
    }

    if (intakeForm?.service_coordinator_information_id) {
      setCompletedSections((prevSections) => {
        const uniqueSections = new Set(prevSections);
        uniqueSections.add(5);
        return uniqueSections;
      });
    }

    if (intakeForm?.more_about_information_id) {
      setCompletedSections((prevSections) => {
        const uniqueSections = new Set(prevSections);
        uniqueSections.add(6);
        return uniqueSections;
      });
    }

    if (intakeForm?.medical_information_id) {
      setCompletedSections((prevSections) => {
        const uniqueSections = new Set(prevSections);
        uniqueSections.add(7);
        return uniqueSections;
      });
    }

    if (intakeForm?.admission_information_id) {
      setCompletedSections((prevSections) => {
        const uniqueSections = new Set(prevSections);
        uniqueSections.add(8);
        return uniqueSections;
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intakeForm]);

  const handleDisplayedComponent = () => {
    switch (currentIndex) {
      case 1:
        return (
          <ClientInformation
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            handleChangeSectionid={handleChangeSectionid}
            intakeForm={intakeForm}
            isViewing={isViewing}
            isEditing={isEditing}
            refetch={refetch}
          />
        );
      case 2:
        return (
          <ReferralInformation
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            prevSectionId={prevSectionId}
            handleChangeSectionid={handleChangeSectionid}
            intakeForm={intakeForm}
            isViewing={isViewing}
            isEditing={isEditing}
            refetch={refetch}
          />
        );
      case 3:
        return (
          <IntakeInformation
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            prevSectionId={prevSectionId}
            handleChangeSectionid={handleChangeSectionid}
            intakeForm={intakeForm}
            isViewing={isViewing}
            isEditing={isEditing}
            refetch={refetch}
          />
        );
      case 4:
        return (
          <ContactInformation
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            prevSectionId={prevSectionId}
            handleChangeSectionid={handleChangeSectionid}
            intakeForm={intakeForm}
            isViewing={isViewing}
            isEditing={isEditing}
            refetch={refetch}
          />
        );
      case 5:
        return (
          <ServiceCordinatorInformation
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            prevSectionId={prevSectionId}
            handleChangeSectionid={handleChangeSectionid}
            intakeForm={intakeForm}
            isViewing={isViewing}
            isEditing={isEditing}
            refetch={refetch}
          />
        );
      case 6:
        return (
          <AboutParticipant
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            prevSectionId={prevSectionId}
            handleChangeSectionid={handleChangeSectionid}
            intakeForm={intakeForm}
            isViewing={isViewing}
            isEditing={isEditing}
            refetch={refetch}
          />
        );
      case 7:
        return (
          <MedicalInformation
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            prevSectionId={prevSectionId}
            handleChangeSectionid={handleChangeSectionid}
            intakeForm={intakeForm}
            isViewing={isViewing}
            isEditing={isEditing}
            refetch={refetch}
          />
        );
      case 8:
        return (
          <AdmissionInformation
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            prevSectionId={prevSectionId}
            intakeForm={intakeForm}
            isViewing={isViewing}
            isEditing={isEditing}
            refetch={refetch}
          />
        );
      default:
        return null;
    }
  };

  const isViewingOrEditing = isViewing || isEditing;

  if (
    isLoading ||
    (isViewing && clientIntakeLoading) ||
    (isEditing && clientIntakeLoading)
  ) {
    return <Loader height="h-[70vh]" />;
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="z-30 flex flex-col gap-5">
        {!isViewing && !isEditing && (
          <BreadCrumb
            links={[
              {
                name: "All Clients",
                route: admin ? "/admin/clients" : "/clients",
              },
              {
                name: "New Intake",
                route: admin
                  ? "/admin/clients/new-intake"
                  : "/clients/new-intake",
              },
            ]}
            fixed={true}
          />
        )}

        {isViewingOrEditing && (
          <BreadCrumb
            links={[
              {
                name: "All Clients",
                route: admin ? "/admin/clients" : "/clients",
              },
              {
                name: capitalizeFirstLetter(
                  `${
                    intakeForm?.clientInformation?.first_name ??
                    intakeForm?.first_name ??
                    "-"
                  } ${
                    intakeForm?.clientInformation?.last_name ??
                    intakeForm?.last_name ??
                    "-"
                  }`
                ),
                route: admin
                  ? `/admin/clients/${intakeForm?.id}`
                  : `/clients/${intakeForm?.id}`,
              },
              {
                name: "Intake Form",
                route: admin
                  ? `/admin/clients/${intakeForm?.id}/forms/intake?mode=${
                      isViewing ? "view" : "edit"
                    }`
                  : `/clients/${intakeForm?.id}/forms/intake?mode=${
                      isViewing ? "view" : "edit"
                    }`,
              },
            ]}
            fixed={true}
          />
        )}

        <div className="w-full flex flex-col">
          <h2 className="lg:fixed lg:mt-5 text-[30px] lg:z-30 w-full pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:items-center gap-5">
            {!isEditing && !isViewing && (
              <div>
                {intakeForm
                  ? `Intake Form -
                ${capitalizeFirstLetter(
                  `${
                    intakeForm?.clientInformation?.first_name ??
                    intakeForm.first_name
                  } ${
                    intakeForm?.clientInformation?.last_name ??
                    intakeForm.last_name
                  }`
                )}`
                  : `Intake Form`}
              </div>
            )}
            {isEditing && (
              <div className="flex items-center flex-wrap gap-5">
                Intake Form -{" "}
                {capitalizeFirstLetter(
                  `${
                    intakeForm?.clientInformation?.first_name ??
                    intakeForm?.first_name ??
                    "-"
                  } ${
                    intakeForm?.clientInformation?.last_name ??
                    intakeForm?.last_name ??
                    "-"
                  }`
                )}
                <FormBadge status={formatClientStatus(intakeForm?.status!)}>
                  {formatClientStatus(intakeForm?.status!)}
                </FormBadge>
              </div>
            )}
            {isViewing && (
              <div className="flex items-center flex-wrap gap-5">
                Intake Form -{" "}
                {capitalizeFirstLetter(
                  `${
                    intakeForm?.clientInformation?.first_name ??
                    intakeForm?.first_name ??
                    "-"
                  } ${
                    intakeForm?.clientInformation?.last_name ??
                    intakeForm?.last_name ??
                    "-"
                  }`
                )}
                <FormBadge status={formatClientStatus(intakeForm?.status!)}>
                  {formatClientStatus(intakeForm?.status!)}
                </FormBadge>
              </div>
            )}
          </h2>

          <div className="flex gap-5 w-full lg:w-[300px] items-center lg:mt-28 xl:mt-10 mt-10 ml-auto">
            <Progress
              className="w-full lg:w-[280px] xl:z-40"
              value={completedPercentage}
            />
            <p className="text-[14px] text-[#334155] font-[500] z-40">
              {completedPercentage}%
            </p>
          </div>
        </div>
      </div>

      <section className="w-full flex flex-col lg:flex-row">
        <SideNavigation
          formSidebar={CLIENTS_FORM_SIDEBAR}
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          completedSections={completedSections}
          restrictNavigation={isViewing ? false : true}
          className="2xl:h-[60vh] lg:h-[52vh] z-10"
        />

        <div className="flex flex-col gap-5 lg:ml-[250px] flex-1 z-20">
          {handleDisplayedComponent()}
        </div>
      </section>
    </div>
  );
};

export default NewIntakePageWrapper;
