import { QASignature } from "@prisma/client";
import React, { Fragment, useMemo } from "react";

import Detail from "@/components/detail";
import Flex from "@/components/flex";
import { StaticImage } from "@/components/static-image";
import { cn, formatDate, formatDateTime, getFullName } from "@/lib";
import { SkilledNursingNoteResponse } from "@/types";

const Checkbox = ({
  label,
  checked,
  className,
}: {
  label: string;
  checked: boolean;
  className?: string;
}) => {
  return (
    <div>
      <input type="checkbox" checked={checked} />{" "}
      <label className={className}>{label}</label>
    </div>
  );
};
const Section = ({
  title,
  children,
  className,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <section className={"mb-6"}>
      <h4 className="font-bold mb-2 uppercase">{title}</h4>
      <div className={cn("border px-4 py-2 rounded-lg", className)}>
        {children}
      </div>
    </section>
  );
};

type Props = {
  data?: SkilledNursingNoteResponse;
  qASignature?:
    | (QASignature & {
        patientSignatureUrl?: string;
        nurseSignatureUrl?: string;
      })
    | null;
};

const PrintSNNote = React.forwardRef<HTMLDivElement, Props>(
  ({ qASignature, data }, ref) => {
    const tableData = useMemo(() => {
      if (data?.skinAndWound?.woundcare) {
        return data?.skinAndWound?.woundcare;
      }
      return [];
    }, [data?.skinAndWound?.woundcare]);

    return (
      <div
        ref={ref}
        className={`bg-background p-8 rounded-lg shadow-md`}
        id="print-box"
        style={{
          width: "1200px",
        }}
      >
        <div className="flex text-xl relative font-semibold mb-6 items-center">
          <h2 className="text-xl font-bold absolute">
            COLLEEN'S STAFFING DIVISION
          </h2>
          <h3 className="text-2xl font-semibold underline flex-1 text-center">
            SKILLED NURSING VISIT NOTE
          </h3>
        </div>
        <div className="border mb-6 px-4 py-2 flex gap-4 flex-col">
          <div className="flex justify-between gap-4">
            <Detail
              title="Patient"
              detail={getFullName(
                data?.patient?.firstName,
                data?.patient?.lastName,
              )}
            />
            <Detail
              title="Admit Date"
              detail={formatDate(
                data?.patient?.patientAdmission?.[0]?.createdAt as Date,
              )}
            />
            <Detail
              title="DOB"
              detail={formatDate(data?.patient?.dob as Date)}
            />
            <Detail title="Sex" detail={data?.patient?.gender?.charAt(0)} />
            <Detail title="PAN#" detail={data?.patient?.pan} />
          </div>
          <div className="flex justify-between gap-4">
            <Detail
              title="Nurse"
              detail={getFullName(
                data?.caregiver?.firstName,
                data?.caregiver?.lastName,
              )}
            />
            <Detail
              title="Type of Visit"
              detail={data?.vitalSigns?.visitType}
            />
            <Detail
              title="Visit Date & Time"
              detail={`${formatDateTime(data?.vitalSigns?.startTime as Date)}-${formatDateTime(data?.vitalSigns?.endTime as Date)}`}
            />
          </div>
        </div>
        <Section title="homebound reasons">
          <>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  value: "requires-assistance",
                  label: "Requires assistance for most to all ADL",
                },
                {
                  value: "unsafe-to-leave",
                  label: "Unsafe to leave home unassisted",
                },
                {
                  value: "patient-is-bedridden",
                  label: "Patient is Bedridden",
                },
                { value: "medical-restriction", label: "Medical restrictions" },
                {
                  value: "taxing-effort",
                  label: "Taxing effort to leave home",
                },
                {
                  value: "depended-upon-device",
                  label: "Dependent upon supportive device(s)",
                },
                { value: "sob-on-exertion", label: "SOB on exertion" },
                { value: "other", label: "Other" },
              ].map((item) => (
                <Checkbox
                  label={item.label}
                  checked={
                    !!data?.vitalSigns?.homeboundReason?.includes(item.value)
                  }
                  key={item?.value}
                />
              ))}
            </div>
            <Detail
              title="Comments"
              detail={data?.vitalSigns?.homeboundComment}
            />
          </>
        </Section>
        <Section title="Vital Signs">
          <div className="grid grid-cols-3">
            <div className="gap-2 flex-col flex ">
              <Detail
                title="Temperature"
                detail={data?.vitalSigns?.temperature}
              />
              <Detail title="Pulse" detail={data?.vitalSigns?.pulse} />
              <Detail
                title="Respirations"
                detail={data?.vitalSigns?.respiration}
              />
              <Detail title="Note" detail={data?.vitalSigns?.notes} />
            </div>
            <div className="gap-2 flex-col flex border-x border-dashed pl-2">
              <Detail
                title="Blood Pressure Right"
                detail={data?.vitalSigns?.bloodPressureRight}
              />
              <Detail
                title="Blood Pressure Left"
                detail={data?.vitalSigns?.bloodPressureLeft}
              />
              <Detail
                title="Weight"
                detail={data?.vitalSigns?.bloodPressureWeight}
              />
            </div>
            <div className="gap-2 flex-col flex pl-2">
              <Checkbox
                label="Patient denies pain"
                checked={data?.vitalSigns?.painDenied === true}
              />
              <Detail
                title="Pain Location"
                detail={data?.vitalSigns?.painLocation}
              />
              <Detail title="Pain Other" detail={data?.vitalSigns?.otherPain} />
              <Detail
                title="Pain Intensity"
                detail={data?.vitalSigns?.painIntensity}
                helperText={"(scale of 1 to 10)"}
              />
              <Detail
                title="Pain Duration"
                detail={data?.vitalSigns?.painDuration}
              />
              <Detail
                title="Pain acceptable level"
                detail={data?.vitalSigns?.painLevel}
                helperText={"(scale of 1 to 10)"}
              />
              <Detail
                title="Medication last taken"
                detail={data?.vitalSigns?.medicationTaken}
              />
              <Detail
                title="Pain Description"
                detail={data?.vitalSigns?.painDescription}
              />
              <Detail
                title="Pain Management Intervention"
                detail={data?.vitalSigns?.painManagement}
              />
            </div>
          </div>
        </Section>
        <Section title="Cardiovascular">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex gap-12">
                <Checkbox
                  label="Normal"
                  checked={data?.cardioPulm?.cardiovascularNormal === true}
                  className="font-bold"
                />
                <div className="flex gap-4">
                  <p className="font-bold">Heart Sounds</p>
                  {[
                    { value: "regular", label: "Regular" },
                    { value: "irregular", label: "Irregular" },
                    { value: "murmur", label: "Murmur" },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={data?.cardioPulm?.heartSound === item?.value}
                      key={item?.value}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-4 mt-12">
                <p className="font-bold">Edema</p>
                <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                  {[
                    { value: "sacral", label: "Sacral" },
                    { value: "pitting", label: "Pitting" },
                    { value: "non-pitting", label: "Non-Pitting" },
                    { value: "claudication", label: "Claudication" },
                    { value: "pedal", label: "Pedal" },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={!!data?.cardioPulm?.edema?.includes(item?.value)}
                      key={item?.value}
                    />
                  ))}
                  <Detail
                    title="Pitting Severity"
                    detail={
                      [
                        { value: "1", label: "+1" },
                        { value: "2", label: "+2" },
                        { value: "3", label: "+3" },
                        { value: "4", label: "+4" },
                      ]?.find(
                        (item) =>
                          data?.cardioPulm?.edemaSeverity === item?.value,
                      )?.label
                    }
                  />
                </div>
              </div>
              <Detail
                title="Location"
                detail={data?.cardioPulm?.edemaLocation}
              />
            </div>
            <Flex col className="border-dashed  border-l pl-2">
              <Flex gap={2}>
                <p className="font-bold">Chest Pain</p>
                <Checkbox
                  label={"No Chest Pain"}
                  checked={data?.cardioPulm?.chestPain === true}
                />
              </Flex>
              <Flex gap={4}>
                <p className="font-bold">Location</p>
                {[
                  { value: "substernal", label: "Substernal" },
                  { value: "left", label: "Left Shoulder/Hand" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.cardioPulm?.chestPainLocation?.includes(
                        item?.value,
                      )
                    }
                    key={item?.value}
                  />
                ))}
              </Flex>
              <Flex gap={4}>
                <Detail
                  title="Duration"
                  detail={data?.cardioPulm?.painDuration}
                />
                <Flex>
                  <Detail
                    title="Intensity"
                    detail={data?.cardioPulm?.painIntensity}
                  />
                  <p className="text-sm">Scale of 0 to 10</p>
                </Flex>
              </Flex>
              <Flex gap={4}>
                <p className="font-bold">Type</p>
                {[
                  { value: "dull", label: "Dull" },
                  { value: "aching", label: "Aching" },
                  { value: "sharp", label: "Sharp" },
                  { value: "anginal", label: "Anginal" },
                  { value: "radiating", label: "Radiating" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.cardioPulm?.painType?.includes(item?.value)
                    }
                    key={item?.value}
                  />
                ))}
              </Flex>
              <Detail
                title="Aggravating/Relieving Factors"
                detail={data?.cardioPulm?.relievingFactor}
              />
              <Detail
                title="Cardiovascular Note"
                detail={data?.cardioPulm?.cardiovascularNote}
              />
            </Flex>
          </div>
        </Section>
        <Section title="Pulmonary">
          <div className="flex gap-12">
            <Checkbox
              label="Normal"
              checked={data?.cardioPulm?.pulmonaryNormal === true}
              className="font-bold"
            />
            <Flex col>
              <div className="flex gap-4">
                <p className="font-bold">Lung Sounds</p>
                <div className="flex gap-4">
                  {[
                    { value: "clear", label: "Clear" },
                    { value: "crackles", label: "Crackles" },
                    { value: "rales", label: "Rales" },
                    { value: "wheeze", label: "Wheeze" },
                    { value: "rhonchi", label: "Rhonchi" },
                    { value: "diminished", label: "Diminished" },
                    { value: "absent", label: "Absent" },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={
                        !!data?.cardioPulm?.lungSound?.includes(item?.value)
                      }
                      key={item?.value}
                    />
                  ))}
                </div>
              </div>
              <Flex gap={12}>
                <div className="flex gap-4">
                  <p className="font-bold">Anterior:</p>
                  <div className="flex gap-4">
                    {[
                      { value: "right", label: "Right" },
                      { value: "left", label: "Left" },
                    ].map((item) => (
                      <Checkbox
                        label={item?.label}
                        checked={
                          !!data?.cardioPulm?.anterior?.includes(item?.value)
                        }
                        key={item?.value}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <p className="font-bold">Posterior:</p>
                  <div className="flex gap-4">
                    {[
                      { value: "right-upper", label: "Right Upper" },
                      { value: "right-lower", label: "Right Lower" },
                      { value: "left-upper", label: "Left Upper" },
                      { value: "left-lower", label: "Left Lower" },
                    ].map((item) => (
                      <Checkbox
                        label={item?.label}
                        checked={
                          !!data?.cardioPulm?.posterior?.includes(item?.value)
                        }
                        key={item?.value}
                      />
                    ))}
                  </div>
                </div>
              </Flex>
              <div className="flex gap-4">
                <p className="font-bold">Cough:</p>
                <div className="flex gap-4">
                  {[
                    { value: "none", label: "None" },
                    { value: "acute", label: "Acute" },
                    { value: "chronic", label: "Chronic" },
                    { value: "dry", label: "Dry" },
                    { value: "productive", label: "Productive" },
                    {
                      value: "unable-to-cough",
                      label: "Unable to cough secretions",
                    },
                    { value: "suction-needed", label: "Suction Needed" },
                    { value: "hemoptysis", label: "Hemoptysis" },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={!!data?.cardioPulm?.cough?.includes(item?.value)}
                      key={item?.value}
                    />
                  ))}
                </div>
              </div>
              <Flex gap={12}>
                <div className="flex gap-4">
                  <p className="font-bold">Respiratory Status:</p>
                  <div className="flex gap-4">
                    {[
                      { value: "sob", label: "SOB" },
                      { value: "dyspnea", label: "Dyspnea" },
                      { value: "orthopnea", label: "Orthopnea" },
                      { value: "prn", label: "PRN" },
                      { value: "continuous", label: "Continuous" },
                    ].map((item) => (
                      <Checkbox
                        label={item?.label}
                        checked={
                          !!data?.cardioPulm?.respiratoryStatus?.includes(
                            item?.value,
                          )
                        }
                        key={item?.value}
                      />
                    ))}
                  </div>
                </div>
                <Detail title="Oxygen" detail={data?.cardioPulm?.oxygen} />
                <Detail
                  title="Pulse Oximetry"
                  detail={data?.cardioPulm?.pulseOximetry}
                />
              </Flex>
              <Detail
                title="Pulmonary Note"
                detail={data?.cardioPulm?.pulmonaryNote}
              />
            </Flex>
          </div>
        </Section>
        <Section title="Neuromuscular">
          <div className="grid grid-cols-2">
            <Flex col>
              <Checkbox
                label="Normal"
                checked={data?.neuroGastro?.neuromuscularNormal === true}
                className="font-bold"
              />
              <div className="flex gap-4">
                <p className="font-bold">Mental Status:</p>
                {[
                  { value: "disoriented", label: "Disoriented" },
                  { value: "agitated", label: "Agitated" },
                  { value: "forgetful", label: "Forgetful" },
                  { value: "depressed", label: "Depressed" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.neuroGastro?.mentalStatus?.includes(item?.value)
                    }
                    key={item?.value}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <p className="font-bold">Alert & Oriented to:</p>
                {[
                  { value: "person", label: "Person" },
                  { value: "place", label: "Place" },
                  { value: "time", label: "Time" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.neuroGastro?.mentalStatusOrientedTo?.includes(
                        item?.value,
                      )
                    }
                    key={item?.value}
                  />
                ))}
              </div>
              <Flex gap={12}>
                <div className="flex gap-4">
                  <p className="font-bold">Grip Strength:</p>
                  {[
                    { value: "equal", label: "Equal" },
                    { value: "unequal", label: "Unequal" },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={data?.neuroGastro?.gripStrength === item?.value}
                      key={item?.value}
                    />
                  ))}
                </div>
                <Detail
                  title="Grasp Left"
                  detail={data?.neuroGastro?.gripLeft}
                />
                <Detail
                  title="Grasp Right"
                  detail={data?.neuroGastro?.gripRight}
                />
              </Flex>
              <Detail
                title="Neuromuscular Note:"
                detail={data?.neuroGastro?.neuromuscularNote}
              />
            </Flex>
            <Flex col className="pl-4 border-dashed border-l">
              <Checkbox
                label="Headache"
                checked={data?.neuroGastro?.headache === true}
                className="font-bold"
              />
              <div className="flex gap-4">
                <p className="font-bold">Impairment</p>
                {[
                  { value: "visual", label: "Visual" },
                  { value: "speech", label: "Speech" },
                  { value: "hearing", label: "Hearing" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.neuroGastro?.impairment?.includes(item?.value)
                    }
                    key={item?.value}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <p className="font-bold">Mark Applicable</p>
                {[
                  { value: "syncope", label: "Syncope" },
                  { value: "vertigo", label: "Vertigo" },
                  { value: "ataxia", label: "Ataxia" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.neuroGastro?.markApplicableNeuro?.includes(
                        item?.value,
                      )
                    }
                    key={item?.value}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <p className="font-bold">Pupils</p>
                {[
                  { value: "perrla", label: "PERRLA" },
                  { value: "unequal", label: "Unequal" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={data?.neuroGastro?.pupils === item?.value}
                    key={item?.value}
                  />
                ))}
              </div>
              <Detail title="Falls" detail={data?.neuroGastro?.falls} />
            </Flex>
          </div>
        </Section>
        <Section title="Gastrointestinal" className="flex flex-col gap-2">
          <Flex className="items-start" gap={12}>
            <Checkbox
              label="Normal"
              checked={data?.neuroGastro?.bowelMovementNormal === true}
              className="font-bold"
            />
            <Flex col>
              <Flex gap={12}>
                <div className="flex gap-4">
                  <p className="font-bold">Bowel Sounds:</p>
                  {[
                    { value: "normal", label: "Normal" },
                    { value: "abnormal", label: "Abnormal" },
                    { value: "hypoactive", label: "Hypoactive" },
                    { value: "hyperactive", label: "Hyperactive" },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={
                        !!data?.neuroGastro?.bowelSounds?.includes(item?.value)
                      }
                      key={item?.value}
                    />
                  ))}
                </div>
                <Detail
                  title="Bewel Sounds Note"
                  detail={data?.neuroGastro?.bowelSoundsNote}
                />
              </Flex>
              <div className="flex gap-4">
                <p className="font-bold">Abdomical Pain:</p>
                {[
                  { value: "continuous", label: "Continuous" },
                  { value: "intermittent", label: "Intermittent" },
                  { value: "non-tender", label: "Non-tender" },
                  { value: "diffuse", label: "Diffuse" },
                  { value: "localized", label: "Localized" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.neuroGastro?.abdominalPain?.includes(item?.value)
                    }
                    key={item?.value}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <p className="font-bold">Appetite:</p>
                {[
                  { value: "good", label: "Good" },
                  { value: "fair", label: "Fair" },
                  { value: "poor", label: "Poor" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={data?.neuroGastro?.apetite === item?.value}
                    key={item?.value}
                  />
                ))}
                <Detail
                  title="Diet"
                  detail={data?.neuroGastro?.nutritionalRequirement}
                />
              </div>
            </Flex>
          </Flex>
          <Checkbox label={"NPO"} checked={data?.neuroGastro?.npo === true} />
          <p className="font-bold text-center">Tube Feeding</p>
          <Flex gap={12}>
            <div className="flex gap-4">
              <p className="font-bold">Bowel Movement:</p>
              {[
                { value: "distention", label: "Distention" },
                { value: "flatulence", label: "Flatulence" },
                { value: "diarrhea", label: "Diarrhea" },
                { value: "constipation", label: "Constipation" },
                { value: "incontinence", label: "Incontinence" },
                { value: "impaction", label: "Impaction" },
              ].map((item) => (
                <Checkbox
                  label={item?.label}
                  checked={
                    !!data?.neuroGastro?.bowelMovement?.includes(item?.value)
                  }
                  key={item?.value}
                />
              ))}
            </div>
          </Flex>
          <p className="font-bold text-center">Last BM</p>
          <Flex gap={12}>
            <div className="flex gap-4">
              <p className="font-bold">Mark Applicable:</p>
              {[
                { value: "colostomy", label: "Colostomy" },
                { value: "ileostomy", label: "Ileostomy" },
              ].map((item) => (
                <Checkbox
                  label={item?.label}
                  checked={
                    !!data?.neuroGastro?.markApplicableGastro?.includes(
                      item?.value,
                    )
                  }
                  key={item?.value}
                />
              ))}
            </div>
            <Detail
              title="Gastrointestinal note"
              detail={data?.neuroGastro?.gastrointestinalNote}
            />
          </Flex>
        </Section>
        <Section title="Genitourinary" className="flex flex-col gap-2">
          <Flex className="items-start" gap={12}>
            <Checkbox
              label="Normal"
              checked={data?.genitoEndo?.genitourinaryNormal === true}
              className="font-bold"
            />
            <Flex className="flex-1 items-start">
              <Detail
                title="Urine Frequency"
                detail={data?.genitoEndo?.urineFrequency}
                className="flex-1"
              />
              <Detail
                title="Urine Color"
                detail={data?.genitoEndo?.urineColor}
                className="flex-1"
              />
              <Detail
                title="Urine Odor"
                detail={data?.genitoEndo?.urineOdor}
                className="flex-1"
              />
            </Flex>
          </Flex>
          <Flex gap={12}>
            <div className="flex gap-4">
              <p className="font-bold">Symptoms:</p>
              {[
                { value: "incontinence", label: "Incontinence" },
                { value: "urgency", label: "Urgency" },
                { value: "hesitancy", label: "Hesitancy" },
                { value: "dysuria", label: "Dysuria" },
                { value: "nocturia", label: "Nocturia" },
                { value: "oliguria", label: "Oliguria" },
                { value: "retention", label: "Retention" },
              ].map((item) => (
                <Checkbox
                  label={item?.label}
                  checked={!!data?.genitoEndo?.symptoms?.includes(item?.value)}
                  key={item?.value}
                />
              ))}
            </div>
          </Flex>
          <Flex gap={12}>
            <p className="font-bold">Urinary Catheter:</p>
            <Flex className="flex-1 justify-stretch items-start">
              <Detail
                title="Type"
                detail={data?.genitoEndo?.urinaryCathetherType}
                className="flex-1"
              />
              <Detail
                title="Size"
                detail={data?.genitoEndo?.urinaryCathetherSize}
                className="flex-1"
              />
              <Detail
                title="Last Changed on"
                detail={formatDate(
                  data?.genitoEndo?.urinaryCathetherLastChanged,
                )}
                className="flex-1"
              />
              <Detail
                title="Irrigation"
                detail={data?.genitoEndo?.urinaryCathetherIrrigation}
                className="flex-1"
              />
              <Detail
                title="Bulb Inflated"
                detail={data?.genitoEndo?.urinaryCathetherBulbInflated}
                className="flex-1"
              />
            </Flex>
          </Flex>
          <Detail
            title="Gastrointestinal note"
            detail={data?.genitoEndo?.genitourinaryNote}
          />
        </Section>
        <Section title="Endocrine">
          <div className="grid grid-cols-2">
            <Flex col>
              <Flex gap={12}>
                <Checkbox
                  label="Normal"
                  checked={data?.genitoEndo?.endocrineNormal === true}
                  className="font-bold"
                />
                <Detail
                  title="Blood Sugar"
                  detail={data?.genitoEndo?.bloodSugar}
                />
              </Flex>

              <div className="flex gap-4">
                <p className="font-bold">Glucometer Reading </p>
                {[
                  { value: "fasting", label: "Fasting" },
                  { value: "postprandial", label: "Postprandial" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.genitoEndo?.glucometerReading?.includes(
                        item?.value,
                      )
                    }
                    key={item?.value}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <p className="font-bold">Frequency of Testing</p>
                {[
                  { value: "daily", label: "Daily" },
                  {
                    value: "more-than-once-a-day",
                    label: "More Than Once a Day",
                  },
                  { value: "ac-hs", label: "AC & HS" },
                  { value: "none", label: "None" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={data?.genitoEndo?.testingFrequency === item?.value}
                    key={item?.value}
                  />
                ))}
              </div>
              <Flex gap={24}>
                <p className="font-bold">Hypo/Hyperglycemia</p>
                <Detail
                  title="Frequency"
                  detail={data?.genitoEndo?.hypoFrequency}
                />
              </Flex>

              <Flex gap={12}>
                <div className="flex gap-4">
                  <p className="font-bold">
                    Patient aware of Signs and Symptoms
                  </p>
                  {[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={data?.genitoEndo?.patientAware === item?.value}
                      key={item?.value}
                    />
                  ))}
                </div>
                <Detail
                  title="Endocrine Note"
                  detail={data?.genitoEndo?.endocrineNote}
                />
              </Flex>
            </Flex>
            <Flex col className="pl-4 border-dashed border-l">
              <div className="flex gap-4">
                <p className="font-bold">Diabetes Controlled with</p>
                {[
                  { value: "insulin", label: "Insulin" },
                  { value: "oral-hypoglycemics", label: "Oral Hypoglycemics" },
                  { value: "diet", label: "Diet" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.genitoEndo?.diabetesControlledWith?.includes(
                        item?.value,
                      )
                    }
                    key={item?.value}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <p className="font-bold">Monitored / Administered by</p>
                {[
                  { value: "self", label: "Self" },
                  { value: "family", label: "Family" },
                  { value: "hh-staff", label: "HH Staff" },
                  { value: "other", label: "Other" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.genitoEndo?.administeredBy?.includes(item?.value)
                    }
                    key={item?.value}
                  />
                ))}
              </div>
            </Flex>
          </div>
        </Section>
        <Section title="Skin">
          <div className="grid grid-cols-2">
            <Flex col>
              <Checkbox
                label="Normal (Warm/Dry/Intact)"
                checked={data?.skinAndWound?.normalSkin === true}
                className="font-bold"
              />
              <div className="flex gap-4">
                <p className="font-bold">Color</p>
                {[
                  { value: "pink", label: "Pink" },
                  { value: "pale", label: "Pale" },
                  { value: "flushed", label: "Flushed" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={data?.skinAndWound?.skinColor === item?.value}
                    key={item?.value}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <p className="font-bold">Temperature</p>
                {[
                  { value: "warm", label: "Warm" },
                  { value: "cool", label: "Cool" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={data?.skinAndWound?.temperature === item?.value}
                    key={item?.value}
                  />
                ))}
              </div>
              <Detail title="Skin Note" detail={data?.skinAndWound?.skinNote} />
            </Flex>
            <Flex col className="pl-4 border-dashed border-l">
              <div className="flex gap-4">
                <p className="font-bold">Turgor</p>
                {[
                  { value: "good", label: "Good" },
                  { value: "fair", label: "Fair" },
                  { value: "poor", label: "Poor" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={data?.skinAndWound?.skinTugor === item?.value}
                    key={item?.value}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <p className="font-bold">Condition</p>
                {[
                  { value: "moist", label: "Moist" },
                  { value: "dry", label: "Dry" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={data?.skinAndWound?.skinCondition === item?.value}
                    key={item?.value}
                  />
                ))}
              </div>
            </Flex>
          </div>
        </Section>
        <Section title="WOUND CARE">
          <div className="grid">
            <table className="min-w-full border-collapse border border-gray-400">
              <thead>
                <tr>
                  <th className="border border-gray-400 p-2">Type of Wound</th>
                  {tableData?.map((item, index) => (
                    <th
                      className="border border-gray-400 p-2 capitalize"
                      key={index}
                    >
                      {item?.woundType}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 font-semibold">
                    Location
                  </td>
                  {tableData?.map((item, index) => (
                    <td className="border border-gray-400 p-2" key={index}>
                      {item?.location ?? "-"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-semibold">
                    Length/Width/Depth
                    <br />
                    <span className="text-xs">in cm</span>
                  </td>
                  {tableData?.map((item, index) => (
                    <td className="border border-gray-400 p-2" key={index}>
                      {item?.length}/{item?.width}/{item?.depth}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-semibold">
                    Drainage
                  </td>
                  {tableData?.map((item, index) => (
                    <td className="border border-gray-400 p-2" key={index}>
                      {item?.drainageType}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-semibold">
                    Tunnelling/Location
                  </td>
                  {tableData?.map((item, index) => (
                    <td className="border border-gray-400 p-2" key={index}>
                      {item?.tunnelling}/{item?.tunnellingLocation}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-semibold">
                    Odor
                  </td>
                  {tableData?.map((item, index) => (
                    <td className="border border-gray-400 p-2" key={index}>
                      <Checkbox
                        checked={item?.odor === "none" ? false : true}
                        label="None"
                      />
                      <Checkbox
                        checked={item?.odor != "none" ? true : false}
                        label="Present"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-semibold">
                    Edema
                  </td>
                  {tableData?.map((item, index) => (
                    <td className="border border-gray-400 p-2" key={index}>
                      <Checkbox
                        checked={item?.edema === "none" ? false : true}
                        label="None"
                      />
                      <Checkbox
                        checked={item?.edema != "none" ? true : false}
                        label="Present"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-semibold">
                    Surr Tissue
                  </td>
                  {tableData?.map((item, index) => (
                    <td className="border border-gray-400 p-2" key={index}>
                      {item?.surroundingTissue?.join(", ")}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <Flex col>
              {[
                {
                  value: "no-signs",
                  label:
                    "No signs and symptoms of infection noted by nurse at this time",
                },
                {
                  value: "signs",
                  label: "Signs and symptoms of infection noted- Explain",
                },
              ].map((item) => (
                <Checkbox
                  label={item?.label}
                  checked={data?.skinAndWound?.signAndSymptoms === item?.value}
                  key={item?.value}
                />
              ))}
              <Checkbox
                label="Doctor Notified"
                checked={!!data?.skinAndWound?.doctorNotified}
              />
              <div className="flex gap-4">
                <p className="font-bold">Response to Teaching</p>
                {[
                  {
                    value: "return-demonstration",
                    label: "Return Demonstration",
                  },
                  {
                    value: "more-teaching-needed",
                    label: "More teaching needed",
                  },
                  { value: "other", label: "Other" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.skinAndWound?.responseToTeaching?.includes(
                        item?.value,
                      )
                    }
                    key={item?.value}
                  />
                ))}
              </div>
              {data?.skinAndWound?.otherResponseToTeaching && (
                <div>
                  <p className="font-bold">Other</p>
                  <p>{data?.skinAndWound?.otherResponseToTeaching}</p>
                </div>
              )}
              <div className="flex gap-4">
                {[
                  {
                    value: "tolerated-procedure-well",
                    label: "Patient Tolerated Procedure Well",
                  },
                  {
                    value: "with-difficulty",
                    label: "Patient Tolerated Procedure with Difficulty",
                  },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.skinAndWound?.responseToTeaching?.includes(
                        item?.value,
                      )
                    }
                    key={item?.value}
                  />
                ))}
              </div>
              {data?.skinAndWound?.procedureDifficultyExplain && (
                <div>
                  <p className="font-bold">Explain</p>
                  <p>{data?.skinAndWound?.procedureDifficultyExplain}</p>
                </div>
              )}
              <div className="flex gap-4">
                <p className="font-bold">Wound Care Teaching Provided to</p>
                {[
                  { value: "family", label: "Family" },
                  { value: "patient", label: "Patient" },
                  { value: "other", label: "Other" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.skinAndWound?.teachingProvidedTo?.includes(
                        item?.value,
                      )
                    }
                    key={item?.value}
                  />
                ))}
              </div>
            </Flex>
          </div>
        </Section>
        <Section title="Medications">
          <Flex col>
            <div className="flex gap-4">
              {[
                {
                  value: "medication-list",
                  label: "Medication List Reviewed and Updated ",
                },
                { value: "allergy-updated", label: "Allergy Updated" },
              ].map((item) => (
                <Checkbox
                  label={item?.label}
                  checked={
                    !!data?.noteMedication?.medicationUpdated?.includes(
                      item?.value,
                    )
                  }
                  key={item?.value}
                />
              ))}
            </div>
            <div className="flex gap-4">
              <p className="font-bold">Administered By</p>
              {[
                { value: "self", label: "Self" },
                { value: "family", label: "Family" },
                { value: "hha-staff", label: "HHA Staff" },
                { value: "other", label: "Other" },
              ].map((item) => (
                <Checkbox
                  label={item?.label}
                  checked={data?.noteMedication?.administeredBy === item?.value}
                  key={item?.value}
                />
              ))}
            </div>
            <Checkbox
              label="Missed Doses"
              checked={false}
              className="font-bold"
            />
            <Detail
              title="Med Note"
              detail={data?.noteMedication?.medicationNote}
            />
            <div className="flex gap-4">
              <p className="font-bold">Medication Changes</p>
              {[
                { value: "unchanged", label: "Unchanged" },
                { value: "changed", label: "New/Changed" },
              ].map((item) => (
                <Checkbox
                  label={item?.label}
                  checked={
                    data?.noteMedication?.medicationChanged === item?.value
                  }
                  key={item?.value}
                />
              ))}
            </div>
          </Flex>
        </Section>
        <Section title="Interventions">
          <Flex col>
            <div className="grid grid-cols-4 w-full gap-4">
              {[
                {
                  value: "skilled-observation",
                  label: "Skilled observation and assessment",
                },
                { value: "observe-adls", label: "Observe ADLs" },
                {
                  value: "diabetic-observation",
                  label: "Diabetic Observation",
                },
                { value: "tracheostomy-care", label: "Tracheostomy Care" },
                { value: "foley-care", label: "Foley Care" },
                { value: "wound-care", label: "Wound Care" },
                { value: "decubitus-care", label: "Decubitus Care" },
                { value: "colostomy-care", label: "Colostomy Care" },
                { value: "post-cataract-care", label: "Post Cataract Care" },
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
              ].map((item) => (
                <Checkbox
                  label={item?.label}
                  checked={
                    !!data?.noteIntervInst?.interventions?.includes(item?.value)
                  }
                  key={item?.value}
                />
              ))}
            </div>

            <Detail
              title="Intervention Note"
              detail={data?.noteIntervInst?.interventionNote}
            />
          </Flex>
        </Section>
        <Section title="INSTRUCTIONS / TEACHINGS">
          <div className="grid grid-cols-4 gap-4">
            <Flex col>
              <Flex col>
                <p className="font-bold underline">Cardiac</p>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "diabetic-teaching", label: "Diabetic Teaching" },
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
                    { value: "self-glucose", label: "Self Glucose monitoring" },
                    {
                      value: "diabetic-safety",
                      label: "Diabetic Safety issues",
                    },
                    { value: "skin-care", label: "Skin/Foot care regimen" },
                    { value: "diet-teaching", label: "Diet Teaching" },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={!!data?.noteIntervInst?.endocrine}
                      key={item?.value}
                    />
                  ))}
                </div>
              </Flex>

              <Flex col>
                <p className="font-bold underline">Respiratory</p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      value: "respiratory-infection",
                      label: "S/S Respiratory Infection",
                    },
                    {
                      value: "inhalation-therapy",
                      label: "Inhalation Therapy",
                    },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={
                        !!data?.noteIntervInst?.respiratory.includes(
                          item?.value,
                        )
                      }
                      key={item?.value}
                    />
                  ))}
                </div>
              </Flex>

              <Flex col>
                <p className="font-bold underline">Gi/Gu</p>
                <div className="flex flex-col gap-2">
                  {[
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
                    { value: "feeding-tube", label: "Feeding Tube Management" },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={
                        !!data?.noteIntervInst?.gigu.includes(item?.value)
                      }
                      key={item?.value}
                    />
                  ))}
                </div>
              </Flex>

              <p className="font-bold">Patient/Caregiver </p>
              <Detail
                title="Interaction Response"
                detail={data?.noteIntervInst?.interactionResponse}
              />
              <Detail
                title="Instructions Note"
                detail={data?.noteIntervInst?.instructionsNote}
              />
            </Flex>

            <Flex col>
              <Flex col>
                <p className="font-bold underline">Endocrine</p>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "diabetic-teaching", label: "Diabetic Teaching" },
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
                    { value: "self-glucose", label: "Self Glucose monitoring" },
                    {
                      value: "diabetic-safety",
                      label: "Diabetic Safety issues",
                    },
                    { value: "skin-care", label: "Skin/Foot care regimen" },
                    { value: "diet-teaching", label: "Diet Teaching" },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={
                        !!data?.noteIntervInst?.endocrine.includes(item?.value)
                      }
                      key={item?.value}
                    />
                  ))}
                </div>
              </Flex>
            </Flex>

            <Flex col>
              <Flex col>
                <p className="font-bold underline">Integumentary</p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      value: "wound-infection",
                      label: "S/S Wound Infection/Prevention",
                    },
                    {
                      value: "decrease-pressure",
                      label: "Measures to decrease Pressure Points",
                    },
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={
                        !!data?.noteIntervInst?.integumentary.includes(
                          item?.value,
                        )
                      }
                      key={item?.value}
                    />
                  ))}
                </div>
              </Flex>

              <Flex col>
                <p className="font-bold underline">Pain</p>
                <div className="flex flex-col gap-2">
                  {[
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
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={
                        !!data?.noteIntervInst?.pain.includes(item?.value)
                      }
                      key={item?.value}
                    />
                  ))}
                </div>
              </Flex>
            </Flex>

            <Flex col>
              <Flex col>
                <p className="font-bold underline">Safety</p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      value: "drug-interactions",
                      label: "Drug/Drug Interactions",
                    },
                    { value: "medication-safety", label: "Medication Safety" },
                    { value: "infection-control", label: "Infection Control" },
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
                  ].map((item) => (
                    <Checkbox
                      label={item?.label}
                      checked={
                        !!data?.noteIntervInst?.safety.includes(item?.value)
                      }
                      key={item?.value}
                    />
                  ))}
                </div>
              </Flex>
            </Flex>
          </div>
        </Section>
        <Section title="PLAN / COORDINATION / CHECKLIST">
          <Flex col>
            <Flex className="w-full justify-between pr-20">
              <div className="flex gap-4">
                <p className="font-bold">Care Plan</p>
                {[
                  {
                    value: "revised",
                    label: "Reviewed/Revised with patient/caregiver",
                  },
                  { value: "achieved-outcome", label: "Achieved Outcome" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={!!data?.notePlan?.carePlan?.includes(item?.value)}
                    key={item?.value}
                  />
                ))}
              </div>
              <Detail
                title="Next HH Nurse Visit"
                detail={data?.notePlan?.nurseVisit}
              />
            </Flex>

            <Flex className="w-full justify-between pr-20">
              <div className="flex gap-4">
                <p className="font-bold">Care Coordination with</p>
                {[
                  { value: "physician", label: "Physician" },
                  { value: "sn", label: "SN" },
                  { value: "pt", label: "PT" },
                  { value: "ot", label: "OT" },
                  { value: "st", label: "ST" },
                  { value: "msw", label: "MSW" },
                  { value: "other", label: "Other" },
                ].map((item) => (
                  <Checkbox
                    label={item?.label}
                    checked={
                      !!data?.notePlan?.careCordinationWith?.includes(
                        item?.value,
                      )
                    }
                    key={item?.value}
                  />
                ))}
              </div>
              <Detail
                title="Next Physician Visit"
                detail={data?.notePlan?.physicianVisit}
              />
            </Flex>

            <Flex gap={24}>
              <Checkbox
                label="Provided Billable Supplies"
                checked={!!data?.notePlan?.providedBillableSupplies}
                className="font-bold"
              />
              <Detail title="Note" detail={data?.notePlan?.planNote} />
            </Flex>
          </Flex>
        </Section>
        <Section title="GENERAL NOTES">
          <div className="p-3">{data?.notePlan?.generalNotes} </div>
        </Section>

        <Flex gap={24}>
          <div className="flex gap-4 items-center">
            <span className="font-bold">Signature of Nurse:</span>
            {qASignature?.nurseSignatureUrl ? (
              <div className="mb-4">
                <div className="max-h-[300px] flex items-center justify-start rounded-lg border-border">
                  <StaticImage
                    src={qASignature?.nurseSignatureUrl}
                    imageClassName={"object-contain"}
                    alt="nurse-signature"
                    className="h-[100px] w-[100px]"
                  />
                </div>
              </div>
            ) : (
              "_______________________________________"
            )}
          </div>
          <p>
            <span className="font-bold">Date:</span>{" "}
            {data?.qASignature?.nurseSignatureDate &&
            qASignature?.nurseSignatureUrl
              ? formatDateTime(data?.qASignature?.nurseSignatureDate as Date)
              : "___________________________"}
          </p>
        </Flex>
      </div>
    );
  },
);

PrintSNNote.displayName = "PrintSNNote";

export default PrintSNNote;
