"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  FileCheck2,
  Heart,
  Users,
  Wallet,
} from "lucide-react";
import styles from "@/app/landing.module.css";

const groups = [
  {
    id: "clients",
    label: "Client & clinical care",
    icon: Heart,
    title: "Start with the person. Keep their story together.",
    description:
      "Move from referral to a clear plan of care, with the client’s needs, documents, and care team connected along the way.",
    features: [
      [
        "Intake & referrals",
        "Track referrals and guide new clients through intake with the information your team needs.",
      ],
      [
        "Client profiles & forms",
        "Keep contacts, care preferences, service requirements, and client forms in one place.",
      ],
      [
        "Assessments & care plans",
        "Use configurable assessments, define care goals, and manage reviews and signatures.",
      ],
    ],
    previewTitle: "A plan built around Margaret",
    rows: [
      ["Intake documents", "Completed"],
      ["Initial assessment", "Reviewed"],
      ["Personal care plan", "Active"],
      ["Care team", "Assigned"],
    ],
    note: "The next visit starts with the right context.",
  },
  {
    id: "visits",
    label: "Scheduling & visits",
    icon: CalendarDays,
    title: "Plan the day. Stay close to every visit.",
    description:
      "Build schedules around your clients and caregivers, then follow the visit from check-in through completed documentation.",
    features: [
      [
        "Scheduling & availability",
        "Create recurring shifts, check staff availability, and identify scheduling conflicts.",
      ],
      [
        "Electronic visit verification",
        "Capture GPS check-in and check-out, visit times, and location information.",
      ],
      [
        "Visit notes & follow-up",
        "Document care with custom templates and signatures, and record missed-visit reasons.",
      ],
    ],
    previewTitle: "Today’s care, in view",
    rows: [
      ["9:00 AM · Personal care", "Completed"],
      ["11:00 AM · Home visit", "Checked in"],
      ["2:00 PM · Respite care", "Scheduled"],
      ["Visit documentation", "Ready for review"],
    ],
    note: "A shared view from the schedule to the visit note.",
  },
  {
    id: "billing",
    label: "Billing & oversight",
    icon: Wallet,
    title: "Keep the care and the paperwork connected.",
    description:
      "See authorized services, billing activity, and operational reports together, with the detail your office needs to follow through.",
    features: [
      [
        "Service authorizations",
        "Track approved hours, visits, or units, with remaining balances and low-authorization alerts.",
      ],
      [
        "Claims, invoices & payroll",
        "Manage billing periods, claim status, client invoices, and payroll records.",
      ],
      [
        "Reports & trends",
        "Review visit documentation, EVV activity, and operational trends with filters and exports.",
      ],
    ],
    previewTitle: "Every detail has a next step",
    rows: [
      ["Service authorization", "Active"],
      ["Visit documentation", "Reviewed"],
      ["October claim", "Ready"],
      ["Client invoice", "Draft"],
    ],
    note: "Know what’s ready and what needs your attention.",
  },
  {
    id: "people",
    label: "People & communication",
    icon: Users,
    title: "Support the people who make care possible.",
    description:
      "Keep workforce readiness and day-to-day communication alongside the care your team delivers.",
    features: [
      [
        "Staff & onboarding",
        "Manage staff profiles, onboarding checklists, and offer-letter workflows.",
      ],
      [
        "Credentials & training",
        "Track credential expirations, training assignments, course completion, and competencies.",
      ],
      [
        "Family access & messaging",
        "Give sponsors care reports, invoice visibility, and a dedicated place to communicate.",
      ],
    ],
    previewTitle: "Ready for the people in their care",
    rows: [
      ["Onboarding checklist", "Completed"],
      ["Professional credentials", "Current"],
      ["Assigned training", "Completed"],
      ["Next supervision", "Scheduled"],
    ],
    note: "Staff records that stay connected to daily operations.",
  },
];

export function FeatureExplorer() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const group = groups[active];
  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % groups.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + groups.length) % groups.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = groups.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }
  return (
    <div className={styles.explorer}>
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Explore CareBase features"
      >
        {groups.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            id={`tab-${item.id}`}
            role="tab"
            aria-selected={active === index}
            aria-controls="feature-panel"
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => handleKey(event, index)}
          >
            <item.icon size={20} strokeWidth={1.7} aria-hidden="true" />
            {item.label}
            <ArrowRight
              size={17}
              className={styles.tabArrow}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <div
        key={group.id}
        role="tabpanel"
        id="feature-panel"
        aria-labelledby={`tab-${group.id}`}
        tabIndex={0}
        className={styles.featurePanel}
      >
        <div className={styles.featureCopy}>
          <h3>{group.title}</h3>
          <p>{group.description}</p>
          <dl>
            {group.features.map(([title, description]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
          <a href="#demo" className={styles.textLink}>
            Explore this in your demo{" "}
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
        <div className={styles.productPreview}>
          <div className={styles.previewBar}>
            <span>
              <Heart size={17} aria-hidden="true" />
              CareBase
            </span>
            <span>Illustrative example</span>
          </div>
          <div className={styles.previewContent}>
            <h4>{group.previewTitle}</h4>
            <div className={styles.previewRecord}>
              <span className={styles.recordIcon}>
                <group.icon size={25} aria-hidden="true" />
              </span>
              <div>
                <strong>
                  {active === 0
                    ? "Margaret Wilson"
                    : active === 1
                      ? "Thursday’s visits"
                      : active === 2
                        ? "Billing checklist"
                        : "Alex Morgan"}
                </strong>
                <span>
                  {active === 0
                    ? "Personalized care, shared context"
                    : active === 1
                      ? "Care team schedule"
                      : active === 2
                        ? "From delivered care to billing"
                        : "Caregiver · Staff profile"}
                </span>
              </div>
            </div>
            <ul className={styles.previewRows}>
              {group.rows.map(([label, status], index) => (
                <li key={label}>
                  <span>{label}</span>
                  <span
                    className={
                      index === 3 ? styles.statusNeutral : styles.status
                    }
                  >
                    <Check size={12} aria-hidden="true" />
                    {status}
                  </span>
                </li>
              ))}
            </ul>
            <div className={styles.previewNote}>
              <FileCheck2 size={18} aria-hidden="true" />
              <p>{group.note}</p>
            </div>
          </div>
          <div className={styles.previewFooter}>
            <ClipboardList size={15} aria-hidden="true" /> Connected records.
            Clear next steps.
          </div>
        </div>
      </div>
    </div>
  );
}
