import { Provider, User } from "@prisma/client";
import dayjs from "dayjs";
import React from "react";
import useSWR from "swr";

import Detail from "@/components/detail";
import { Checkbox } from "@/components/ui";
import {
  insuranceInformationOption,
  legalPaperOptions,
  serviceRequiredOptions,
} from "@/constants";
import { patientConditionRelatedTo } from "@/constants/patient";
import { useAuth } from "@/context/AuthContext";
import {} from "@/hooks";
import { useGetLogs } from "@/hooks/request/patient/log";
import { formatDate, getFullName } from "@/lib";
import { ApiResponse, PatientResponse } from "@/types";

type PatientDetailsPageProps = {
  selected?: PatientResponse;
};

const PatientDetailsPage = React.forwardRef<
  HTMLDivElement,
  PatientDetailsPageProps
>(({ selected }, ref) => {
  const { authUser } = useAuth();
  const { data: logs } = useGetLogs({ id: selected?.id as string });
  const { data: accessInformation } = useSWR<ApiResponse<User[]>>(
    selected?.id ? `/api/patient/access-info?patientId=${selected?.id}` : null,
  );

  const { data } = useSWR<ApiResponse<Provider>>(
    authUser?.providerId ? `/api/provider/${authUser?.providerId}` : null,
  );

  return (
    <div ref={ref} className="mx-8 text-foreground" id="print-box">
      {/* Patient Information */}
      <div className="flex justify-between  mb-8 mt-4">
        <div className="bg-secondary font-bold flex flex-col gap-2 justify-center px-20 py-2 items-center">
          <p>PATIENT'S INFORMATION</p>
          <p>{`${selected?.lastName ?? ""} ${selected?.firstName ?? ""}`}</p>
          <p>Control Number:{selected?.controlNumber}</p>
          <p className="text-sm mt-2">
            Print Date: {dayjs(new Date()).format("DD/MM/YYYY")}
          </p>
        </div>
        <div className="flex-1 font-bold flex flex-col p-2 border-2 border-secondary self-stretch">
          <p className="uppercase">{authUser?.provider?.providerName}</p>
          <p>{data?.data?.address1}</p>
          <p>
            <span className="!font-normal">Tel:</span> {data?.data?.cellPhone}
          </p>
          <p>
            <span className="!font-normal">Fax:</span> {data?.data?.fax}
          </p>
          <p>
            <span className="!font-normal italic">NPI:</span> {data?.data?.npi}
          </p>
        </div>
      </div>

      {/* Patient Details */}
      <div className="border-2 border-secondary p-2">
        <div className="grid grid-cols-2 gap-2">
          <Detail
            title="Date of Birth"
            detail={selected?.dob && dayjs(selected?.dob).format("DD/MM/YYYY")}
          />
          <Detail
            title="Admission Date"
            detail={
              selected?.admissionSOC &&
              dayjs(selected?.admissionSOC).format("DD/MM/YYYY")
            }
          />
          <Detail title="Gender" detail={selected?.gender} />
          <Detail title="Address" detail={selected?.address1} />
          <Detail title="Patients Telephone" detail={selected?.phone} />
          <Detail
            title="Patients Marriage Status"
            detail={selected?.maritalStatus}
          />
          <Detail
            title="Patients Employment Status"
            detail={selected?.employmentStatus}
          />
          <Detail title="Student" detail={selected?.student} />
          <Detail
            title="Admisssion Source"
            detail={selected?.admissionSource}
          />
          <Detail title="CBSA Code" detail={selected?.CBSACode} />
          <Detail
            title="Authorization Number"
            detail={selected?.authorizationNumber}
          />
          <Detail
            title="Face to Face"
            detail={
              selected?.faceToFace &&
              dayjs(selected?.faceToFace).format("DD/MM/YYYY")
            }
          />
          <Detail
            title="Physician"
            detail={getFullName(
              selected?.physician?.lastName,
              selected?.physician?.firstName,
            )}
          />
          <Detail title="NPI" detail={selected?.physician?.npi} />
        </div>

        {/* Patient Condition */}
        <div>
          <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
            PATIENT CONDITION RELATED TO
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Detail
              title="Employment? (Current or Previous)"
              detail={
                selected?.conditionRelation.includes(
                  patientConditionRelatedTo[0].value,
                )
                  ? "Yes"
                  : "No"
              }
            />
            <Detail
              title="Auto Accident"
              detail={
                selected?.conditionRelation.includes(
                  patientConditionRelatedTo[1].value,
                )
                  ? "Yes"
                  : "No"
              }
            />
            <Detail title="Place(State)" detail={selected?.autoAccidentState} />
            <Detail
              title="Other Accident"
              detail={
                selected?.conditionRelation.includes(
                  patientConditionRelatedTo[2].value,
                )
                  ? "Yes"
                  : "No"
              }
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
            EMERGENCY CONTACTS
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Detail
              title="First Name"
              detail={selected?.patientEmergencyContact?.firstName}
            />
            <Detail
              title="Last Name"
              detail={selected?.patientEmergencyContact?.lastName}
            />
            <Detail
              title="Day Phone"
              detail={selected?.patientEmergencyContact?.dayPhone}
            />
            <Detail
              title="Evening Phone"
              detail={selected?.patientEmergencyContact?.eveningPhone}
            />
            <Detail
              title="Relation"
              detail={selected?.patientEmergencyContact?.livesWith}
            />
            <Detail
              title="Address"
              detail={selected?.patientEmergencyContact?.address}
            />
            <Detail
              title="Type"
              detail={selected?.patientEmergencyContact?.type}
            />
          </div>
        </div>

        {/* Next of Kin */}
        <div>
          <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
            NEXT OF KIN
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Detail
              title="Name"
              detail={selected?.patientEmergencyContact?.nextOfKinName}
            />
            <Detail
              title="Relation"
              detail={selected?.patientEmergencyContact?.nextOfKinRelation}
            />
            <Detail
              title="Phone"
              detail={selected?.patientEmergencyContact?.nextOfKinPhone}
            />
            <Detail
              title="Ext"
              detail={selected?.patientEmergencyContact?.nextOfKinExt}
            />
            <Detail
              title="Address"
              detail={selected?.patientEmergencyContact?.nextOfKinAddress}
            />
          </div>
        </div>

        {/* Connect Patient */}
        <div>
          <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
            CONNECT PATIENT WITH EXTERNAL ACO
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Checkbox checked={!!selected?.sharePatient} />
              <p>Share Patient</p>
            </div>
            {/* <Detail title="Share Patient" detail="" /> */}
            <Detail
              title="Referred By"
              detail={selected?.patientReferralSource?.referredBy}
            />
            <Detail
              title="Referred Type"
              detail={selected?.patientReferralSource?.type}
            />
            <Detail
              title="Facility"
              detail={selected?.patientReferralSource?.facility}
            />
            <Detail
              title="Referral Date"
              detail={
                selected?.patientReferralSource?.referralDate &&
                dayjs(selected?.patientReferralSource?.referralDate).format(
                  "DD/MM/YYYY",
                )
              }
            />
            <Detail
              title="Coordinator"
              detail={selected?.patientReferralSource?.coordinator}
            />
            <Detail
              title="Sales Rep"
              detail={selected?.patientReferralSource?.salesRep}
            />
            <Detail
              title="Referral Phone"
              detail={selected?.patientReferralSource?.referralPhone}
            />
            <Detail title="Ext" detail={selected?.patientReferralSource?.ext} />
            <Detail
              title="Disposition"
              detail={selected?.patientReferralSource?.disposition}
            />
            <Detail
              title="Follow Up"
              detail={selected?.patientReferralSource?.followUp}
            />
            <Detail
              title="Other HHA"
              detail={selected?.patientReferralSource?.otherHHA}
            />
            <Detail
              title="Phone"
              detail={selected?.patientReferralSource?.phone}
            />
            <Detail
              title="MR Number"
              detail={selected?.patientReferralSource?.mrNumber}
            />
            <Detail
              title="Notes"
              detail={selected?.patientReferralSource?.notes}
            />
          </div>
        </div>

        {/* Pharmacy */}
        <div>
          <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
            PHARMACY
          </p>
          <div className="flex flex-col gap-2">
            {selected?.patientReferralSource?.pharmacy?.map(
              (pharmacy, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Detail
                    title={`Pharmacy${index + 1}`}
                    detail={pharmacy?.name}
                  />
                  <Detail
                    title={`Phone${index + 1}`}
                    detail={pharmacy?.phone}
                  />
                  <Detail
                    title={`Address${index + 1}`}
                    detail={pharmacy?.address}
                  />
                  <Detail title={`Fax${index + 1}`} detail={pharmacy?.fax} />
                </div>
              ),
            )}

            <Detail
              title="Diagnosis"
              detail={selected?.patientReferralSource?.diagnosis}
            />
          </div>
        </div>

        {/* Home Environment */}
        <div>
          <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
            HOME ENVIRONMENT
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Detail
              title="Patient lives with"
              detail={selected?.patientEmergencyContact?.livesWith}
            />
            <Detail
              title="Pets in home"
              detail={selected?.patientEmergencyContact?.homePet}
            />
            <Detail
              title="Smokes in home"
              detail={selected?.patientEmergencyContact?.smokesInHome}
            />
          </div>
        </div>

        {/* Legal Paper */}
        <div>
          <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
            LEGAL PAPERS
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  !!selected?.patientEmergencyContact?.isAdvancedDirective
                }
              />
              <p>Advanced Directives</p>
            </div>
            <Detail
              title="Location of"
              detail={selected?.patientEmergencyContact?.location}
            />
            {legalPaperOptions?.map((item) => (
              <div key={item.value} className="flex items-center gap-2">
                <Checkbox
                  checked={selected?.patientEmergencyContact?.legalPaperOption.some(
                    (it) => it === item.value,
                  )}
                />
                <p>{item.label}</p>
              </div>
            ))}
            <Detail
              title="Power of Attorney"
              detail={selected?.patientEmergencyContact?.attorneyPower}
            />
            <Detail
              title="attorney"
              detail={selected?.patientEmergencyContact?.poaPhone}
            />
          </div>
        </div>

        {/* Managed Care */}
        <div>
          {selected?.patientInsurance.map((item, index) => (
            <div key={index}>
              <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
                Insurance: {item.type && item?.type.split("_").join(" ")}
              </p>

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!item.status} />
                    <p className="!capitalize">
                      {item.type &&
                        item?.type
                          .split("_")
                          .join(" ")
                          .toLocaleLowerCase()}{" "}
                      {item.type === "NON_MEDICARE"
                        ? "(Episodic) UB04)"
                        : item.type === "MANAGED_CARE"
                          ? "(Non Episodic) UB04"
                          : item.type === "CMS" && "1500"}
                    </p>
                  </div>
                  <Detail
                    title="Days Per Episode"
                    detail={item?.daysPerEpisode}
                  />
                  {(item.type === "MANAGED_CARE" ||
                    item.type === "NON_MEDICARE") && (
                    <Detail
                      title="No. of Visits Authorized"
                      detail={item?.noOfVisitAuthorized}
                    />
                  )}
                  {(item.type === "MANAGED_CARE" ||
                    item.type === "NON_MEDICARE" ||
                    item.type === "CMS") && (
                    <Detail title="Company" detail={item?.company} />
                  )}
                  {(item.type === "MANAGED_CARE" ||
                    item.type === "NON_MEDICARE") && (
                    <Detail
                      title="Patient Insured ID"
                      detail={item?.insuredId}
                    />
                  )}
                </div>
                <Detail title="Services Required" />
                <div className="grid grid-cols-2 gap-2">
                  {serviceRequiredOptions?.map((it) => (
                    <div key={it.value} className="flex items-center gap-2">
                      <Checkbox
                        checked={item?.serviceRequired.some(
                          (newItem) => newItem === it.value,
                        )}
                      />
                      <p>{it.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Insurance Information */}
        <div>
          <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
            HMO/PPO/Commercial: INSURANCE INFORMATION
          </p>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              {insuranceInformationOption?.map((item) => (
                <div key={item.value} className="flex items-center gap-2">
                  <Checkbox
                    checked={selected?.patientCommercial?.insuranceInformation.some(
                      (it) => it === item.value,
                    )}
                  />
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Detail
                title="Payor ID"
                detail={selected?.patientCommercial?.payId}
              />
              <Detail
                title="Policy Holder"
                detail={selected?.patientCommercial?.policyHolder}
              />
              <Detail
                title="Insured/Policy Holder"
                detail={selected?.patientCommercial?.insuredHolder}
              />
              <Detail
                title="Unique ID"
                detail={selected?.patientCommercial?.uniqueId}
              />
              <Detail
                title="Gender"
                detail={selected?.patientCommercial?.gender}
              />
              <Detail
                title="DOB"
                detail={
                  selected?.patientCommercial?.dob &&
                  dayjs(selected?.patientCommercial?.dob).format("DD/MM/YYYY")
                }
              />
              <Detail
                title="Address"
                detail={selected?.patientCommercial?.address}
              />
              <Detail
                title="Phone"
                detail={selected?.patientCommercial?.phone}
              />
              <Detail
                title="Employer or School"
                detail={selected?.patientCommercial?.employer}
              />
              <Detail
                title="Group Name"
                detail={selected?.patientCommercial?.groupName}
              />
              <Detail
                title="Group Number"
                detail={selected?.patientCommercial?.groupNumber}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selected?.patientCommercial?.isOtherBenefitPlan}
              />
              <p>Check if there is another Health Benefit Plan</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Detail
                title="Other Insured"
                detail={selected?.patientCommercial?.otherInsured}
              />
              <Detail
                title="Employer or School"
                detail={selected?.patientCommercial?.otherBenefitPlanEmployer}
              />
              <Detail
                title="Gender"
                detail={selected?.patientCommercial?.otherBenefitPlanGender}
              />
              <Detail
                title="DOB"
                detail={
                  selected?.patientCommercial?.otherBenefitPlanDob &&
                  dayjs(
                    selected?.patientCommercial?.otherBenefitPlanDob,
                  ).format("DD/MM/YYYY")
                }
              />
              <Detail
                title="Group Name"
                detail={selected?.patientCommercial?.otherBenefitPlanGroupName}
              />
              <Detail
                title="Group Number"
                detail={
                  selected?.patientCommercial?.otherBenefitPlanGroupNumber
                }
              />
            </div>
          </div>
        </div>

        {/* Authorization Tracker */}
        <div className="flex flex-col gap-2">
          {selected?.patientAuthorization?.map((authorization, index) => (
            <div key={index}>
              <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
                AUTHORIZATION TRACKER {index + 1}
              </p>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Detail
                    title="Start"
                    detail={dayjs(authorization?.startDate).format(
                      "DD/MM/YYYY",
                    )}
                  />
                  <Detail
                    title="End"
                    detail={dayjs(authorization?.endDate).format("DD/MM/YYYY")}
                  />
                  <Detail title="Status" detail={authorization?.status} />
                  <Detail title="Insurance" detail={authorization?.insurance} />
                  <Detail
                    title="Authorization Number"
                    detail={authorization?.number}
                  />
                  <Detail
                    title="Total Visits Authorized"
                    detail={authorization?.visitsAuthorized}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Detail title="SN" detail={authorization?.sn} />
                  <Detail title="PT" detail={authorization?.pt} />
                  <Detail title="OT" detail={authorization?.ot} />
                  <Detail title="ST" detail={authorization?.st} />
                  <Detail title="MSW" detail={authorization?.msw} />
                  <Detail title="RN" detail={authorization?.rn} />
                  <Detail title="LVN" detail={authorization?.lvn} />
                </div>
                <Detail title="Comments" detail={authorization?.comment} />
              </div>
            </div>
          ))}
        </div>

        {/* Patient Log */}
        <div>
          <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
            PATIENT LOG INFORMATION
          </p>

          <div className="grid grid-cols-3 gap-2">
            {logs?.data
              ?.map((log) => `[${formatDate(log.createdAt)}]: ${log.text}`)
              .join("; ")}
          </div>
        </div>

        {/* Assigned Clinicians */}
        <div>
          <p className="flex justify-center uppercase font-bold bg-secondary  py-1 my-1">
            ASSIGNED CLINICIAN'S
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Detail
              title="Caregiver"
              detail={accessInformation?.data
                ?.map(
                  (caregiver) =>
                    `${caregiver.firstName ?? ""} ${caregiver.lastName ?? ""}`,
                )
                .join(", ")}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

PatientDetailsPage.displayName = "PatientDetailsPage";

export default PatientDetailsPage;
