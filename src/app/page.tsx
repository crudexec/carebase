import Link from "next/link";
import {
  Users,
  Calendar,
  FileText,
  ClipboardList,
  AlertTriangle,
  DollarSign,
  UserCog,
  CheckSquare,
  Shield,
  GitBranch,
  Heart,
  Clock,
  TrendingUp,
  Lock,
  Smartphone,
  BarChart3,
  ArrowRight,
  Check,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Client Management",
    description:
      "Comprehensive client profiles with medical history, care preferences, emergency contacts, and detailed service requirements.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Intelligent shift scheduling with availability tracking, conflict detection, and automated notifications for carers and clients.",
    color: "bg-success/10 text-success",
  },
  {
    icon: FileText,
    title: "Visit Notes",
    description:
      "Digital visit documentation with customizable templates, photo attachments, and real-time sync across all devices.",
    color: "bg-info/10 text-info",
  },
  {
    icon: ClipboardList,
    title: "Care Plans",
    description:
      "Create and manage personalized care plans with goals, interventions, and progress tracking for each client.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: AlertTriangle,
    title: "Incident Reports",
    description:
      "Streamlined incident reporting with severity classification, follow-up tracking, and compliance documentation.",
    color: "bg-error/10 text-error",
  },
  {
    icon: DollarSign,
    title: "Billing & Claims",
    description:
      "Automated billing workflows, insurance claim management, and detailed financial reporting for your agency.",
    color: "bg-success/10 text-success",
  },
  {
    icon: UserCog,
    title: "Staff Management",
    description:
      "Complete staff lifecycle management including credentials, training records, certifications, and performance tracking.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: CheckSquare,
    title: "Assessments",
    description:
      "Standardized assessment tools for client evaluations, risk assessments, and care level determinations.",
    color: "bg-info/10 text-info",
  },
  {
    icon: Shield,
    title: "Authorizations",
    description:
      "Track service authorizations, manage approval workflows, and monitor utilization against authorized hours.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: GitBranch,
    title: "Referral Tracking",
    description:
      "Manage incoming referrals from hospitals, physicians, and case managers with complete tracking and follow-up.",
    color: "bg-error/10 text-error",
  },
  {
    icon: Heart,
    title: "Sponsor Portal",
    description:
      "Family members can view care reports, daily updates, and communicate with caregivers through a dedicated portal.",
    color: "bg-role-sponsor/20 text-foreground",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Comprehensive reporting dashboard with KPIs, compliance metrics, and customizable data visualizations.",
    color: "bg-primary/10 text-primary",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Save 10+ Hours Weekly",
    description: "Automate scheduling, billing, and documentation tasks",
  },
  {
    icon: TrendingUp,
    title: "Improve Care Quality",
    description: "Real-time monitoring and standardized care protocols",
  },
  {
    icon: Lock,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security for patient data protection",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Access everything from any device, anywhere",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "50K+", label: "Visits Tracked" },
  { value: "500+", label: "Care Providers" },
  { value: "4.9/5", label: "User Rating" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                CareBase
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-body-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-body-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Benefits
              </a>
              <a
                href="#contact"
                className="text-body-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-body-sm text-foreground-secondary hover:text-foreground transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-primary hover:bg-primary-hover text-white text-body-sm font-medium px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-success/5 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-body-sm font-medium mb-8 animate-slideUp">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Trusted by 500+ Care Agencies
            </div>

            {/* Headline */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-slideUp"
              style={{ animationDelay: "0.1s" }}
            >
              Modern Care Management
              <br />
              <span className="text-primary">Built for Excellence</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto mb-10 animate-slideUp"
              style={{ animationDelay: "0.2s" }}
            >
              Streamline your home care operations with an all-in-one platform
              for scheduling, documentation, billing, and family communication.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slideUp"
              style={{ animationDelay: "0.3s" }}
            >
              <Link
                href="/register"
                className="group bg-primary hover:bg-primary-hover text-white font-medium px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="bg-white hover:bg-background-secondary text-foreground font-medium px-8 py-4 rounded-xl border border-border transition-all flex items-center gap-2"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20 animate-slideUp"
            style={{ animationDelay: "0.4s" }}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-background-tertiary border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-body-sm text-foreground-secondary">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-background-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to
              <br />
              <span className="text-primary">Deliver Exceptional Care</span>
            </h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
              A comprehensive suite of tools designed specifically for home care
              agencies, from client intake to billing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-background-tertiary border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-body text-foreground-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Leading Agencies
                <br />
                <span className="text-primary">Choose CareBase</span>
              </h2>
              <p className="text-lg text-foreground-secondary mb-10">
                Join hundreds of care agencies who have transformed their
                operations with our modern, intuitive platform.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-body text-foreground-secondary">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-success/10 rounded-3xl blur-2xl" />
              <div className="relative bg-background-tertiary rounded-3xl border border-border p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Setup Complete
                    </div>
                    <div className="text-body-sm text-foreground-secondary">
                      Your agency is ready to go
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    "Client profiles imported",
                    "Staff schedules configured",
                    "Billing settings applied",
                    "Care templates activated",
                    "Mobile app connected",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary"
                    >
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-success" />
                      </div>
                      <span className="text-body text-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <div className="text-body-sm text-foreground-secondary mb-2">
                    Average setup time
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    Under 24 Hours
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-sidebar">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your
            <br />
            Care Agency Operations?
          </h2>
          <p className="text-lg text-sidebar-text mb-10 max-w-2xl mx-auto">
            Join the growing community of care providers who trust CareBase to
            manage their operations efficiently and deliver better outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="group bg-white hover:bg-background-secondary text-sidebar font-medium px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="text-white hover:text-sidebar-text font-medium px-8 py-4 rounded-xl border border-sidebar-hover hover:bg-sidebar-hover transition-all flex items-center gap-2"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-background-tertiary border border-border hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
              <p className="text-body text-foreground-secondary mb-4">
                Mon-Fri from 8am to 6pm
              </p>
              <a
                href="tel:+1-800-CARE-123"
                className="text-primary hover:text-primary-hover font-medium"
              >
                +1 (800) CARE-123
              </a>
            </div>

            <div className="text-center p-8 rounded-2xl bg-background-tertiary border border-border hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
              <p className="text-body text-foreground-secondary mb-4">
                We&apos;ll respond within 24 hours
              </p>
              <a
                href="mailto:support@carebase.com"
                className="text-primary hover:text-primary-hover font-medium"
              >
                support@carebase.com
              </a>
            </div>

            <div className="text-center p-8 rounded-2xl bg-background-tertiary border border-border hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Visit Us</h3>
              <p className="text-body text-foreground-secondary mb-4">
                Our headquarters
              </p>
              <span className="text-primary font-medium">
                San Francisco, CA
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-background-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                CareBase
              </span>
            </div>

            <div className="flex items-center gap-8">
              <a
                href="#"
                className="text-body-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-body-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-body-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                HIPAA Compliance
              </a>
            </div>

            <p className="text-body-sm text-foreground-tertiary">
              &copy; {new Date().getFullYear()} CareBase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
