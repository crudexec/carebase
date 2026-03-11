"use client";

import { useState, useCallback, useEffect } from "react";
import FormDisabledModal from "../FormDisabledModal";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { useRouter } from "next/navigation";
import FormBadge from "@/components/badge/FormBadge";
import { Progress } from "@/components/ui/progress";
import SideNavigation from "../SideNavigation";
import FormBanner from "@/components/banner/FormBanner";
import EmployeeInformation from "./EmployeeInformation";
import useUser from "@/hooks/useUser";
import useCustomQuery from "@/hooks/useCustomQuery";
import useForms from "@/hooks/forms/useForms";
import Loader from "@/components/Loader";
import AttestationAndSignature from "./AttestationAndSignature";
import { retrieveCjisForm } from "@/use-cases/forms";
import { setsAreEqual } from "@/utils";
import UploadProof from "./UploadProof";
import { CJIS_DOCUMENT_URL } from "@/constants";
import FormApprovedModal from "../FormApprovedModal";
import BreadCrumb from "@/components/BreadCrumb";

const CJIS_FORM_SIDEBAR = [
  {
    id: 1,
    name: "Employee Information",
  },
  {
    id: 2,
    name: "Attestation & Signature",
  },
  {
    id: 3,
    name: "Upload Completion Proof",
  },
];

type MethodState = {
  employeeInformation: "POST" | "PATCH";
  signature: "POST" | "PATCH";
};

const CJISFormWrapper = () => {
  const router = useRouter();
  const [method, setMethod] = useState<MethodState>({
    employeeInformation: "POST",
    signature: "POST",
  });
  const [status, setStatus] = useState<FormattedFormStatus>("Not Filled");
  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );

  const { data: user, isLoading: userDataLoading } = useUser();
  const {
    data: formData,
    isLoading: formDataLoading,
    refetch: refetchFormStatus,
  } = useForms();

  const formStatusData = formData?.status;

  const {
    data: formInfo,
    isLoading: formInfoLoading,
    refetch,
  } = useCustomQuery<any>("cjisForm", retrieveCjisForm);

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

  useEffect(() => {
    if (formStatusData && typeof formStatusData !== "boolean") {
      setStatus(formStatusData?.cjisAttestation);
    }
  }, [formStatusData]);

  useEffect(() => {
    if (!formInfoLoading && formInfo && typeof formInfo !== "boolean") {
      const employeeInformation = formInfo.data.employeeInformation;
      const signature = formInfo.data.signatureForm;
      const cjisForm = formInfo.data.cjisForm;

      const updatedSections = new Set(completedSections);

      if (employeeInformation && Object.keys(employeeInformation).length > 0) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          employeeInformation: "PATCH",
        }));
        updatedSections.add(1);
      }

      if (signature && Object.keys(signature).length > 0) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          signature: "PATCH",
        }));
        updatedSections.add(2);
      }

      if (cjisForm && cjisForm.pre_registration_id) {
        updatedSections.add(3);
      }

      if (!setsAreEqual(completedSections, updatedSections)) {
        setCompletedSections(updatedSections);
      }
    }
  }, [formInfoLoading, formInfo, completedSections]);

  const handleDisplayedComponent = () => {
    switch (currentIndex) {
      case 1:
        return (
          <EmployeeInformation
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            handleNewCompletedSection={handleNewCompletedSection}
            user={user!}
            refetch={refetch}
            method={method.employeeInformation}
            formInfo={formInfo}
          />
        );
      case 2:
        return (
          <AttestationAndSignature
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            handleNewCompletedSection={handleNewCompletedSection}
            refetch={refetch}
            method={method.signature}
            formInfo={formInfo}
            status={status}
            refetchFormStatus={refetchFormStatus}
            signatureDisabled={!completedSections.has(1)}
          />
        );
      case 3:
        return (
          <UploadProof
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            handleNewCompletedSection={handleNewCompletedSection}
            refetch={refetch}
            method={method.signature}
            formInfo={formInfo}
            status={status}
            refetchFormStatus={refetchFormStatus}
            signatureDisabled={!completedSections.has(1)}
          />
        );

      default:
        return null;
    }
  };

  const modifiedSidebar = CJIS_FORM_SIDEBAR.filter((item, index) => {
    if (formInfo && typeof formInfo !== "boolean") {
      const employeeInformation = formInfo.data.employeeInformation;
      const signature = formInfo.data.signatureForm;

      if (
        employeeInformation &&
        Object.keys(employeeInformation).length > 0 &&
        signature &&
        Object.keys(signature).length > 0
      ) {
        return true;
      } else {
        return index === 0 || index === 1;
      }
    } else {
      return index === 0 || index === 1;
    }
  });

  const totalSections = modifiedSidebar.length;
  const completedPercentage = Math.floor(
    (completedSections.size / totalSections) * 100
  );

  if (userDataLoading || formDataLoading || formInfoLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex flex-col gap-5 relative">
      {status === "Awaiting Approval" && <FormDisabledModal />}
      {status === "Approved" && <FormApprovedModal formName="CJIS Form" />}

      <div className="flex flex-col gap-5 bg-white">
        <BreadCrumb
          links={[
            {
              name: "Forms",
              route: "/onboarding/form",
            },
            {
              name: "CJIS Attestation",
              route: "/onboarding/form/cjis-form",
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <span>CJIS Attestation</span>
              <FormBadge status={status}>{status}</FormBadge>
            </div>

            <div className="hidden xl:flex mr-[10px] gap-5 w-[300px] items-center">
              <Progress
                className="w-full lg:w-[280px] xl:z-40"
                value={completedPercentage}
              />
              <p className="text-[14px] text-[#334155] font-[500] z-40">
                {completedPercentage}%
              </p>
            </div>
          </div>

          <div className="flex gap-5 w-full lg:w-[300px] items-center lg:mt-28 xl:hidden mt-10 ml-auto">
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

      <section className="relative w-full flex flex-col lg:flex-row lg:mt-0 xl:mt-[90px] mt-0">
        <SideNavigation
          formSidebar={modifiedSidebar}
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          completedSections={completedSections}
        />
        <div className="flex flex-col gap-5 lg:ml-[250px] flex-1 lg:pl-10 mt-[5vh]">
          {status === "Correction Required" && (
            <FormBanner
              variant="warning"
              text={formInfo?.data?.cjisForm?.review_notes}
            />
          )}

          {modifiedSidebar.length === 2 &&
            status !== "Awaiting Approval" &&
            currentIndex === 1 && (
              <FormBanner text="Review prefilled fields to make sure they are correct for this form " />
            )}
          {modifiedSidebar.length === 3 && currentIndex === 1 && (
            <FormBanner
              text="Please download, print, and fill in the applicant information section only of this document and take to your nearest CJIS fingerprint and background check center for fingerprinting."
              downloadLink={CJIS_DOCUMENT_URL}
            />
          )}

          {handleDisplayedComponent()}
        </div>
      </section>
    </div>
  );
};

export default CJISFormWrapper;
