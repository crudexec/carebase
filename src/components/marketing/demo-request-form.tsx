"use client";

import * as React from "react";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

type FormStatus = "idle" | "loading" | "success" | "error";

export function DemoRequestForm() {
  const [status, setStatus] = React.useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    companySize: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit request");
      }

      setStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyName: "",
        companySize: "",
        message: "",
      });
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">
          Thank You!
        </h3>
        <p className="text-foreground-secondary max-w-md mx-auto">
          We&apos;ve received your demo request and will be in touch within 24 hours
          to schedule your personalized walkthrough.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-primary hover:text-primary-hover font-medium"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-error/10 border border-error/20">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1.5">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="John"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1.5">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="Smith"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            Work Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="john@company.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-1.5">
            Company Name *
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            required
            value={formData.companyName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="Acme Home Care"
          />
        </div>
        <div>
          <label htmlFor="companySize" className="block text-sm font-medium text-foreground mb-1.5">
            Company Size *
          </label>
          <select
            id="companySize"
            name="companySize"
            required
            value={formData.companySize}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            <option value="">Select size...</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
          Tell us about your needs
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          placeholder="What challenges are you looking to solve? Any specific features you're interested in?"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-medium px-6 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Request Demo
          </>
        )}
      </button>

      <p className="text-center text-xs text-foreground-tertiary">
        By submitting, you agree to our Privacy Policy and Terms of Service.
      </p>
    </form>
  );
}
