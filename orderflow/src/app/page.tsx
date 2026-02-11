import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  CreditCard,
  Store,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Online Store",
    description: "Create a beautiful online store in minutes with customizable templates",
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Track stock levels, get low stock alerts, and manage multiple locations",
  },
  {
    icon: ShoppingCart,
    title: "Order Management",
    description: "Process orders efficiently with automated workflows and notifications",
  },
  {
    icon: Users,
    title: "Customer CRM",
    description: "Build relationships with customer profiles, purchase history, and notes",
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    description: "Accept payments via cards, bank transfers, and mobile money",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Get insights into sales, profits, and customer behavior",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: ["10 products", "20 orders/month", "Basic analytics", "Email support"],
  },
  {
    name: "Starter",
    price: "5,000",
    description: "For growing businesses",
    features: [
      "100 products",
      "200 orders/month",
      "2 staff accounts",
      "Standard analytics",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: "10,000",
    description: "For established businesses",
    features: [
      "Unlimited products",
      "Unlimited orders",
      "5 staff accounts",
      "3 locations",
      "Advanced analytics",
      "Custom domain",
    ],
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="font-bold text-xl">OrderFlow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary">
              Login
            </Link>
            <Link href="/register">
              <Button>Get Started Free</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Manage your business
              <br />
              <span className="text-primary">with ease</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              OrderFlow is the all-in-one business management platform that helps you
              sell online, manage inventory, track orders, and grow your business.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Everything you need to run your business</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                From inventory management to customer relationships, OrderFlow has all the
                tools you need to succeed.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that works best for your business. Upgrade or downgrade
                anytime.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl p-8 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground ring-2 ring-primary"
                      : "bg-white border"
                  }`}
                >
                  {plan.popular && (
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-white text-primary rounded-full mb-4">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p
                    className={`mt-2 text-sm ${
                      plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {plan.description}
                  </p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold">
                      {plan.price === "0" ? "Free" : `₦${plan.price}`}
                    </span>
                    {plan.price !== "0" && (
                      <span
                        className={`text-sm ${
                          plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        /month
                      </span>
                    )}
                  </div>
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            plan.popular ? "text-primary-foreground" : "text-green-500"
                          }`}
                        />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block mt-8">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "secondary" : "default"}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to grow your business?
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
              Join thousands of businesses already using OrderFlow to manage and grow
              their operations.
            </p>
            <Link href="/register" className="inline-block mt-8">
              <Button size="lg" variant="secondary">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="font-bold text-xl">OrderFlow</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-foreground">
                Contact
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2024 OrderFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
