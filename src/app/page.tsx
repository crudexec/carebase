import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { DemoRequestForm } from "@/components/marketing/demo-request-form";
import { FeatureExplorer } from "@/components/marketing/feature-explorer";
import styles from "./landing.module.css";

const marketingFont = localFont({
  src: "../../public/fonts/manrope-bold.ttf",
  variable: "--font-marketing",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareBase | Connected home care management",
  description:
    "Bring your home care agency together with client intake, scheduling, EVV, care plans, visit notes, staff management, and billing in CareBase.",
};

const capabilities = [
  {
    title: "Documentation that fits your care.",
    description:
      "Build assessments, care plans, and visit notes around the information your team needs. Keep the structure consistent while giving each client a personal plan.",
    items: [
      "Custom form templates and required fields",
      "Care goals, interventions, and progress tracking",
      "Signature capture, PDF export, and fax workflows",
    ],
    icon: ClipboardCheck,
  },
  {
    title: "A clearer view of every visit.",
    description:
      "Connect the schedule to what happens in the field. Give your office the context to follow up on missed visits, outstanding notes, and changes in care.",
    items: [
      "GPS check-in and check-out with visit times",
      "Missed-visit reasons and documentation",
      "Visit note review and incident follow-up",
    ],
    icon: MapPin,
  },
  {
    title: "Keep families in the conversation.",
    description:
      "Give sponsors a dedicated place to follow care, read updates, and message caregivers. Keep communication connected to the people receiving care.",
    items: [
      "Daily care reports and monthly summaries",
      "Caregiver messaging in the sponsor portal",
      "Invoice visibility and reviewed incident updates",
    ],
    icon: MessageCircle,
  },
];

const faqs = [
  {
    question: "What can my agency manage in CareBase?",
    answer:
      "CareBase brings together client intake and referrals, assessments, care plans, scheduling, electronic visit verification, visit notes, staff credentials and training, authorizations, claims, invoices, payroll, and reporting. The feature explorer above shows how these tools support different parts of your day.",
  },
  {
    question: "Can we use our own forms and care templates?",
    answer:
      "Yes. Template builders let your team configure assessments, care plans, and visit notes with sections, different field types, and required information. You can adapt documentation to your agency’s workflows and keep a consistent structure across the team.",
  },
  {
    question: "How does electronic visit verification work?",
    answer:
      "Caregivers can check in and out with location capture and visit times. Office teams can review visit information in the EVV dashboard and reports. During your demo, we can review your state and payer workflow and discuss the configuration your agency needs.",
  },
  {
    question: "What can caregivers and family members access?",
    answer:
      "Caregivers have tools for their schedules, check-in, and visit documentation. Sponsors have a dedicated portal for care reports, messages, and invoices. Role-based permissions separate the workflows available to administrators, clinical staff, caregivers, and sponsors.",
  },
  {
    question: "Can we manage staff readiness as well as client care?",
    answer:
      "Yes. CareBase includes staff profiles, onboarding, credential expiration alerts, training courses and sessions, and competency tracking. Your team can keep workforce records alongside the scheduling and care workflows they support.",
  },
  {
    question: "What should we bring to a demo?",
    answer:
      "Bring the workflows you want to improve: a scheduling challenge, a care-documentation process, a billing requirement, or a form you use today. Include your agency size and priorities in the request below so the walkthrough can focus on what matters to your team.",
  },
];

function Brand() {
  return (
    <span className={styles.brand}>
      <span className={styles.brandMark}>
        <Heart size={22} strokeWidth={2.2} aria-hidden="true" />
      </span>
      CareBase<span className={styles.brandDot}>.</span>
    </span>
  );
}

export default function Home() {
  return (
    <div className={`${styles.page} ${marketingFont.variable}`}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.nav}`}>
          <Link href="/" aria-label="CareBase home">
            <Brand />
          </Link>
          <nav className={styles.navLinks} aria-label="Main navigation">
            <a href="#features">Platform</a>
            <a href="#care">Connected care</a>
            <a href="#questions">FAQs</a>
          </nav>
          <div className={styles.navActions}>
            <Link href="/login" className={styles.signIn}>
              Sign in
            </Link>
            <a href="#demo" className={styles.button}>
              Book a demo <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <details className={styles.mobileMenu}>
            <summary aria-label="Open navigation">
              <span>Menu</span>
              <ChevronDown size={16} aria-hidden="true" />
            </summary>
            <nav aria-label="Mobile navigation">
              <a href="#features">Explore the platform</a>
              <a href="#care">Connected care</a>
              <a href="#questions">FAQs</a>
              <Link href="/login">Sign in</Link>
              <a href="#demo">Book a demo</a>
            </nav>
          </details>
        </div>
      </header>

      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.container}>
            <div className={styles.heroHeading}>
              <h1 id="hero-title">
                Every visit.
                <br />
                Everyone <span>connected.</span>
              </h1>
              <div className={styles.heroIntro}>
                <p>
                  Home care takes a whole team.
                  <br />
                  Give yours one place to work.
                </p>
                <p>
                  CareBase brings scheduling, care documentation, staff, and
                  billing together—so the details stay connected to the people
                  who matter.
                </p>
                <a href="#demo" className={styles.button}>
                  Let’s talk about your agency{" "}
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a href="#features" className={styles.textLink}>
                  Explore the platform{" "}
                  <ArrowDown size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div
              className={styles.careDay}
              aria-label="Illustrative connected care workflow"
            >
              <div className={styles.dayIntro}>
                <span className={styles.dayIcon}>
                  <Heart size={25} aria-hidden="true" />
                </span>
                <h2>
                  A little less chasing.
                  <br />A lot more caring.
                </h2>
                <p>
                  One visit, connected from
                  <br className={styles.desktopBreak} /> the office to the front
                  door.
                </p>
                <span className={styles.exampleLabel}>
                  Illustrative workflow
                </span>
              </div>
              <ol className={styles.daySteps}>
                <li>
                  <span className={styles.stepDot}>
                    <Check size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>The right care, planned.</h3>
                    <p>Care plan ready. Caregiver assigned.</p>
                    <span className={styles.stepTime}>Before the visit</span>
                    <span className={styles.dayTag}>
                      Scheduling + care plans
                    </span>
                  </div>
                </li>
                <li>
                  <span className={styles.stepDot}>
                    <MapPin size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>A visit you can follow.</h3>
                    <p>Check-in captured. Care documented.</p>
                    <span className={styles.stepTime}>At the doorstep</span>
                    <span className={styles.dayTag}>EVV + visit notes</span>
                  </div>
                </li>
                <li>
                  <span className={styles.stepDot}>
                    <ClipboardCheck size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>The details, accounted for.</h3>
                    <p>Notes reviewed. Billing in view.</p>
                    <span className={styles.stepTime}>Back at the office</span>
                    <span className={styles.dayTag}>Review + claims</span>
                  </div>
                </li>
              </ol>
            </div>
            <div className={styles.heroFoot}>
              <p>Built around the way home care works.</p>
              <a href="#features">
                From first referral to ongoing care{" "}
                <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          id="features"
          className={`${styles.features} ${styles.section}`}
          aria-labelledby="features-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <h2 id="features-title">
                The whole picture.
                <br />
                <span>Without the loose ends.</span>
              </h2>
              <p>
                Explore the tools that keep your office, caregivers, and clients
                moving together. Start with the part of your day that needs a
                little more clarity.
              </p>
            </div>
            <FeatureExplorer />
          </div>
        </section>

        <section
          id="care"
          className={`${styles.careSection} ${styles.section}`}
          aria-labelledby="care-title"
        >
          <div className={styles.container}>
            <div className={styles.careHeading}>
              <h2 id="care-title">
                Good care lives
                <br />
                in the details.
              </h2>
              <p>
                A note that’s complete. A visit that’s accounted for. A family
                that feels informed. Give every part of care a place to belong.
              </p>
            </div>
            <div className={styles.capabilities}>
              {capabilities.map(({ title, description, items, icon: Icon }) => (
                <article className={styles.capability} key={title}>
                  <Icon
                    className={styles.capabilityIcon}
                    size={30}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <ul>
                    {items.map((item) => (
                      <li key={item}>
                        <Check size={16} aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`${styles.teamSection} ${styles.section}`}
          aria-labelledby="team-title"
        >
          <div className={`${styles.container} ${styles.teamLayout}`}>
            <div>
              <h2 id="team-title">
                One team.
                <br />A shared understanding.
              </h2>
              <p>
                From the person building tomorrow’s schedule to the caregiver
                arriving today, everyone has a role. CareBase gives them the
                tools for it.
              </p>
              <a href="#demo" className={styles.textLink}>
                See your team’s workflow{" "}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <dl className={styles.roles}>
              <div>
                <dt>
                  <CalendarDays size={22} aria-hidden="true" />
                  Office & operations
                </dt>
                <dd>
                  Coordinate intake, recurring shifts, staff availability,
                  authorization balances, and billing from the same platform.
                </dd>
              </div>
              <div>
                <dt>
                  <ShieldCheck size={22} aria-hidden="true" />
                  Clinical & supervisory teams
                </dt>
                <dd>
                  Build care plans, review assessments and visit notes, follow
                  up on incidents, and track care documentation.
                </dd>
              </div>
              <div>
                <dt>
                  <Users size={22} aria-hidden="true" />
                  Caregivers & families
                </dt>
                <dd>
                  Keep visits, care updates, and communication close at hand,
                  with access shaped around each person’s role.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          id="questions"
          className={`${styles.faqSection} ${styles.section}`}
          aria-labelledby="faq-title"
        >
          <div className={`${styles.container} ${styles.faqLayout}`}>
            <div>
              <h2 id="faq-title">
                A few things
                <br />
                you might be wondering.
              </h2>
              <p>
                There’s a lot that goes into running a care agency. We’re here
                to walk through the details with you.
              </p>
              <a href="#demo" className={styles.textLink}>
                Let’s talk <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
            <div className={styles.faqs}>
              {faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>
                    {faq.question}
                    <ChevronDown size={20} aria-hidden="true" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          id="demo"
          className={`${styles.demoSection} ${styles.section}`}
          aria-labelledby="demo-title"
        >
          <div className={`${styles.container} ${styles.demoLayout}`}>
            <div className={styles.demoIntro}>
              <Heart size={42} strokeWidth={1.4} aria-hidden="true" />
              <h2 id="demo-title">
                Bring your day
                <br />
                into better focus.
              </h2>
              <p>
                Tell us a little about your agency. We’ll explore how CareBase
                can support your team, your workflows, and the people in your
                care.
              </p>
              <ul>
                <li>
                  <Check size={18} aria-hidden="true" />A walkthrough shaped
                  around your priorities
                </li>
                <li>
                  <Check size={18} aria-hidden="true" />A closer look at the
                  features you need
                </li>
                <li>
                  <Check size={18} aria-hidden="true" />
                  Time for your team’s questions
                </li>
              </ul>
              <div className={styles.demoContact}>
                <span>Prefer to start with an email?</span>
                <a href="mailto:support@carebase.com">
                  support@carebase.com{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className={styles.demoForm}>
              <h3>Let’s meet your agency.</h3>
              <p>Request a personalized CareBase demo.</p>
              <DemoRequestForm />
            </div>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <Link href="/" aria-label="CareBase home">
              <Brand />
            </Link>
            <p>Connected teams. Thoughtful care.</p>
            <Link href="/register" className={styles.textLink}>
              Create an account <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.footerBottom}>
            <span>
              © {new Date().getFullYear()} CareBase. All rights reserved.
            </span>
            <nav aria-label="Footer navigation">
              <a href="#features">Platform</a>
              <a href="#questions">FAQs</a>
              <a href="mailto:support@carebase.com">Contact</a>
              <Link href="/login">Sign in</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
