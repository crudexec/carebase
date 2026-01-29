import * as React from "react";
import { format } from "date-fns";

interface Physician {
  id: string;
  firstName: string;
  lastName: string;
  npi: string | null;
  specialty: string | null;
  phone: string | null;
  fax?: string | null;
}

interface CaseManager {
  id: string;
  firstName: string;
  lastName: string;
}

interface Diagnosis {
  id?: string;
  icdCode: string;
  icdDescription: string;
  diagnosisType: string;
  onsetDate?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

interface Order {
  id?: string;
  disciplineType: string;
  bodySystem?: string | null;
  orderText: string;
  orderExplanation?: string | null;
  goals?: string | null;
  goalsExplanation?: string | null;
  orderStatus?: string;
  isFrequencyOrder?: boolean;
  effectiveDate?: string | null;
  isActive?: boolean;
}

interface CarePlanPrintData {
  id?: string;
  status: string;
  effectiveDate?: string | null;
  endDate?: string | null;
  certStartDate?: string | null;
  certEndDate?: string | null;
  signatureSentDate?: string | null;
  signatureReceivedDate?: string | null;
  verbalSOCDate?: string | null;
  summary?: string | null;
  internalNotes?: string | null;
  medications?: string | null;
  dmeSupplies?: string | null;
  safetyMeasures?: string | null;
  nutritionalRequirements?: string | null;
  allergies?: string | null;
  functionalLimitations?: string[];
  otherFunctionalLimit?: string | null;
  activitiesPermitted?: string[];
  otherActivitiesPermit?: string | null;
  mentalStatus?: string[];
  otherMentalStatus?: string | null;
  prognosis?: string | null;
  cognitiveStatus?: string | null;
  rehabPotential?: string | null;
  dischargePlan?: string | null;
  riskIntervention?: string | null;
  advancedDirectives?: string | null;
  caregiverNeeds?: string | null;
  homeboundStatus?: string | null;
  carePreferences?: string | null;
  careLevel?: string | null;
  recommendedHours?: number | null;
  physicianCertStatement?: string | null;
  // Manual physician entry fields
  physicianName?: string | null;
  physicianNpi?: string | null;
  physicianPhone?: string | null;
  physicianFax?: string | null;
  nurseSignature?: string | null;
  nurseSignedAt?: string | null;
  clientSignature?: string | null;
  clientSignedAt?: string | null;
  clientSignerName?: string | null;
  clientSignerRelation?: string | null;
  physician?: Physician | null;
  caseManager?: CaseManager | null;
  diagnoses?: Diagnosis[];
  orders?: Order[];
}

interface CarePlanPrintProps {
  data: CarePlanPrintData;
  clientName: string;
}

// Use explicit hex colors to avoid Tailwind's lab() color function
// which is not supported by html2canvas
const colors = {
  white: "#ffffff",
  black: "#000000",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  blue50: "#eff6ff",
  blue200: "#bfdbfe",
  blue700: "#1d4ed8",
};

const formatDate = (date: string | null | undefined): string => {
  if (!date) return "—";
  try {
    return format(new Date(date), "MM/dd/yyyy");
  } catch {
    return "—";
  }
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: "16px" }}>
    <h3
      style={{
        fontWeight: "bold",
        fontSize: "12px",
        textTransform: "uppercase",
        backgroundColor: colors.gray100,
        padding: "4px 8px",
        borderBottom: `1px solid ${colors.gray300}`,
      }}
    >
      {title}
    </h3>
    <div style={{ padding: "8px" }}>{children}</div>
  </div>
);

const Field = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <div style={{ marginBottom: "4px" }}>
    <span style={{ fontWeight: 600, fontSize: "11px" }}>{label}: </span>
    <span style={{ fontSize: "11px" }}>{value || "—"}</span>
  </div>
);

const CheckboxItem = ({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
    <input type="checkbox" checked={checked} readOnly style={{ width: "12px", height: "12px" }} />
    <span>{label}</span>
  </div>
);

export const CarePlanPrint = React.forwardRef<HTMLDivElement, CarePlanPrintProps>(
  ({ data, clientName }, ref) => {
    const primaryDiagnosis = data.diagnoses?.find(
      (d) => d.diagnosisType === "PRIMARY"
    );
    const secondaryDiagnoses = data.diagnoses?.filter(
      (d) => d.diagnosisType !== "PRIMARY"
    );

    return (
      <div
        ref={ref}
        id="print-box"
        style={{
          width: "800px",
          fontFamily: "Arial, sans-serif",
          backgroundColor: colors.white,
          padding: "24px",
          color: colors.black,
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "16px",
            borderBottom: `2px solid ${colors.black}`,
            paddingBottom: "12px",
          }}
        >
          <h1 style={{ fontSize: "20px", fontWeight: "bold", textTransform: "uppercase", margin: 0 }}>
            Plan of Care
          </h1>
          <p style={{ fontSize: "12px", color: colors.gray600, margin: "4px 0 0 0" }}>
            Home Health Care Services
          </p>
        </div>

        {/* Client Information */}
        <div
          style={{
            border: `1px solid ${colors.gray300}`,
            borderRadius: "4px",
            marginBottom: "16px",
            padding: "12px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div>
              <Field label="Patient Name" value={clientName} />
              <Field label="Status" value={data.status} />
            </div>
            <div>
              <Field label="Effective Date" value={formatDate(data.effectiveDate)} />
              <Field label="End Date" value={formatDate(data.endDate)} />
            </div>
            <div>
              <Field label="Cert Start" value={formatDate(data.certStartDate)} />
              <Field label="Cert End" value={formatDate(data.certEndDate)} />
            </div>
          </div>
        </div>

        {/* Physician Information */}
        <Section title="Physician Information">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <Field label="Physician Name" value={data.physicianName} />
              <Field label="NPI Number" value={data.physicianNpi} />
            </div>
            <div>
              <Field label="Phone" value={data.physicianPhone} />
              <Field label="Fax" value={data.physicianFax} />
            </div>
          </div>
          {data.caseManager && (
            <div style={{ marginTop: "8px" }}>
              <Field
                label="Case Manager"
                value={`${data.caseManager.firstName} ${data.caseManager.lastName}`}
              />
            </div>
          )}
        </Section>

        {/* Diagnoses */}
        <Section title="Diagnoses (ICD-10)">
          {primaryDiagnosis && (
            <div
              style={{
                marginBottom: "8px",
                padding: "8px",
                backgroundColor: colors.blue50,
                border: `1px solid ${colors.blue200}`,
                borderRadius: "4px",
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "11px", color: colors.blue700 }}>
                PRIMARY:{" "}
              </span>
              <span style={{ fontSize: "11px" }}>
                {primaryDiagnosis.icdCode} - {primaryDiagnosis.icdDescription}
              </span>
            </div>
          )}
          {secondaryDiagnoses && secondaryDiagnoses.length > 0 && (
            <div>
              {secondaryDiagnoses.map((diagnosis, index) => (
                <div key={diagnosis.id || index} style={{ fontSize: "11px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600 }}>{diagnosis.diagnosisType}: </span>
                  {diagnosis.icdCode} - {diagnosis.icdDescription}
                </div>
              ))}
            </div>
          )}
          {(!data.diagnoses || data.diagnoses.length === 0) && (
            <p style={{ fontSize: "11px", color: colors.gray500 }}>No diagnoses recorded</p>
          )}
        </Section>

        {/* Medications & Allergies */}
        <Section title="Medications & Allergies">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "4px" }}>
                Current Medications:
              </p>
              <p style={{ fontSize: "11px", whiteSpace: "pre-wrap" }}>
                {data.medications || "None recorded"}
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "4px" }}>Allergies:</p>
              <p style={{ fontSize: "11px", whiteSpace: "pre-wrap" }}>
                {data.allergies || "NKDA (No Known Drug Allergies)"}
              </p>
            </div>
          </div>
        </Section>

        {/* DME, Safety & Nutrition */}
        <Section title="DME / Safety / Nutrition">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "4px" }}>
                DME & Supplies:
              </p>
              <p style={{ fontSize: "11px", whiteSpace: "pre-wrap" }}>
                {data.dmeSupplies || "—"}
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "4px" }}>
                Safety Measures:
              </p>
              <p style={{ fontSize: "11px", whiteSpace: "pre-wrap" }}>
                {data.safetyMeasures || "—"}
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "4px" }}>
                Nutritional Req:
              </p>
              <p style={{ fontSize: "11px", whiteSpace: "pre-wrap" }}>
                {data.nutritionalRequirements || "—"}
              </p>
            </div>
          </div>
        </Section>

        {/* Functional Status */}
        <Section title="Functional Status">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "8px" }}>
                Functional Limitations:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                {[
                  "Amputation",
                  "Bowel/Bladder Incontinence",
                  "Contracture",
                  "Hearing",
                  "Paralysis",
                  "Endurance",
                  "Ambulation",
                  "Speech",
                  "Legally Blind",
                  "Dyspnea with Minimal Exertion",
                ].map((limitation) => (
                  <CheckboxItem
                    key={limitation}
                    label={limitation}
                    checked={data.functionalLimitations?.includes(limitation) || false}
                  />
                ))}
              </div>
              {data.otherFunctionalLimit && (
                <p style={{ fontSize: "11px", marginTop: "4px" }}>
                  <span style={{ fontWeight: 600 }}>Other: </span>
                  {data.otherFunctionalLimit}
                </p>
              )}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "8px" }}>
                Activities Permitted:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                {[
                  "Complete Bedrest",
                  "Bedrest BRP",
                  "Up as Tolerated",
                  "Transfer Bed/Chair",
                  "Exercises Prescribed",
                  "Partial Weight Bearing",
                  "Independent at Home",
                  "Wheelchair",
                  "Walker",
                  "No Restrictions",
                ].map((activity) => (
                  <CheckboxItem
                    key={activity}
                    label={activity}
                    checked={data.activitiesPermitted?.includes(activity) || false}
                  />
                ))}
              </div>
              {data.otherActivitiesPermit && (
                <p style={{ fontSize: "11px", marginTop: "4px" }}>
                  <span style={{ fontWeight: 600 }}>Other: </span>
                  {data.otherActivitiesPermit}
                </p>
              )}
            </div>
          </div>
          <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "8px" }}>Mental Status:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {[
                  "Oriented",
                  "Comatose",
                  "Forgetful",
                  "Depressed",
                  "Disoriented",
                  "Lethargic",
                  "Agitated",
                ].map((status) => (
                  <CheckboxItem
                    key={status}
                    label={status}
                    checked={data.mentalStatus?.includes(status) || false}
                  />
                ))}
              </div>
              {data.otherMentalStatus && (
                <p style={{ fontSize: "11px", marginTop: "4px" }}>
                  <span style={{ fontWeight: 600 }}>Other: </span>
                  {data.otherMentalStatus}
                </p>
              )}
            </div>
            <div>
              <Field label="Prognosis" value={data.prognosis} />
              <Field label="Care Level" value={data.careLevel} />
              <Field label="Recommended Hours/Week" value={data.recommendedHours?.toString()} />
            </div>
          </div>
        </Section>

        {/* Clinical Narratives */}
        <Section title="Clinical Information">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <Field label="Cognitive Status" value={data.cognitiveStatus} />
              <Field label="Rehabilitation Potential" value={data.rehabPotential} />
              <Field label="Homebound Status" value={data.homeboundStatus} />
              <Field label="Caregiver Needs" value={data.caregiverNeeds} />
            </div>
            <div>
              <Field label="Risk Interventions" value={data.riskIntervention} />
              <Field label="Advanced Directives" value={data.advancedDirectives} />
              <Field label="Discharge Plan" value={data.dischargePlan} />
              <Field label="Care Preferences" value={data.carePreferences} />
            </div>
          </div>
        </Section>

        {/* Orders & Goals */}
        <Section title="Orders & Goals">
          {data.orders && data.orders.length > 0 ? (
            <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: colors.gray100 }}>
                  <th
                    style={{
                      border: `1px solid ${colors.gray300}`,
                      padding: "4px 8px",
                      textAlign: "left",
                    }}
                  >
                    Discipline
                  </th>
                  <th
                    style={{
                      border: `1px solid ${colors.gray300}`,
                      padding: "4px 8px",
                      textAlign: "left",
                    }}
                  >
                    Order
                  </th>
                  <th
                    style={{
                      border: `1px solid ${colors.gray300}`,
                      padding: "4px 8px",
                      textAlign: "left",
                    }}
                  >
                    Goals
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order, index) => (
                  <tr key={order.id || index}>
                    <td
                      style={{
                        border: `1px solid ${colors.gray300}`,
                        padding: "4px 8px",
                        fontWeight: 600,
                      }}
                    >
                      {order.disciplineType}
                    </td>
                    <td style={{ border: `1px solid ${colors.gray300}`, padding: "4px 8px" }}>
                      {order.orderText}
                    </td>
                    <td style={{ border: `1px solid ${colors.gray300}`, padding: "4px 8px" }}>
                      {order.goals || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: "11px", color: colors.gray500 }}>No orders recorded</p>
          )}
        </Section>

        {/* Clinical Summary */}
        <Section title="Clinical Summary">
          <div style={{ marginBottom: "8px" }}>
            <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "4px" }}>
              Care Plan Summary:
            </p>
            <p
              style={{
                fontSize: "11px",
                whiteSpace: "pre-wrap",
                border: `1px solid ${colors.gray200}`,
                padding: "8px",
                borderRadius: "4px",
                backgroundColor: colors.gray100,
              }}
            >
              {data.summary || "No summary provided"}
            </p>
          </div>
          {data.physicianCertStatement && (
            <div>
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "4px" }}>
                Physician Certification Statement:
              </p>
              <p
                style={{
                  fontSize: "11px",
                  whiteSpace: "pre-wrap",
                  border: `1px solid ${colors.gray200}`,
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: colors.gray100,
                }}
              >
                {data.physicianCertStatement}
              </p>
            </div>
          )}
        </Section>

        {/* Signatures */}
        <Section title="Signatures">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            {/* Nurse Signature */}
            <div
              style={{
                border: `1px solid ${colors.gray300}`,
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "8px" }}>
                Nurse Signature:
              </p>
              {data.nurseSignature ? (
                <div>
                  <img
                    src={data.nurseSignature}
                    alt="Nurse Signature"
                    style={{ height: "48px", objectFit: "contain" }}
                  />
                  <p style={{ fontSize: "11px", color: colors.gray600, marginTop: "4px" }}>
                    Signed: {formatDate(data.nurseSignedAt)}
                  </p>
                </div>
              ) : (
                <div style={{ height: "48px", borderBottom: `1px solid ${colors.gray400}` }} />
              )}
            </div>
            {/* Client/Representative Signature */}
            <div
              style={{
                border: `1px solid ${colors.gray300}`,
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "8px" }}>
                Client/Representative Signature:
              </p>
              {data.clientSignature ? (
                <div>
                  <img
                    src={data.clientSignature}
                    alt="Client Signature"
                    style={{ height: "48px", objectFit: "contain" }}
                  />
                  <p style={{ fontSize: "11px", color: colors.gray600, marginTop: "4px" }}>
                    {data.clientSignerName}
                    {data.clientSignerRelation && ` (${data.clientSignerRelation})`}
                    {" - "}
                    Signed: {formatDate(data.clientSignedAt)}
                  </p>
                </div>
              ) : (
                <div style={{ height: "48px", borderBottom: `1px solid ${colors.gray400}` }} />
              )}
            </div>
            {/* Physician Signature */}
            <div
              style={{
                border: `1px solid ${colors.gray300}`,
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              <p style={{ fontWeight: 600, fontSize: "11px", marginBottom: "8px" }}>
                Physician Signature:
              </p>
              <div style={{ height: "48px", borderBottom: `1px solid ${colors.gray400}` }} />
              <p style={{ fontSize: "11px", color: colors.gray600, marginTop: "4px" }}>
                {data.physicianName || "Physician Name"} | Date: ___________
              </p>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "12px",
            borderTop: `1px solid ${colors.gray300}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "11px", color: colors.gray500 }}>
            Generated on {format(new Date(), "MM/dd/yyyy 'at' h:mm a")}
          </p>
        </div>
      </div>
    );
  }
);

CarePlanPrint.displayName = "CarePlanPrint";
