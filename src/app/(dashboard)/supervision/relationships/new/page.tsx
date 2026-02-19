"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SupervisorType, SupervisionFrequency } from "@prisma/client";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const TYPE_OPTIONS: { value: SupervisorType; label: string; description: string }[] = [
  { value: "PRIMARY", label: "Primary Supervisor", description: "Main supervisor responsible for overall performance" },
  { value: "SECONDARY", label: "Secondary Supervisor", description: "Backup supervisor when primary is unavailable" },
  { value: "CLINICAL", label: "Clinical Supervisor", description: "Oversees clinical skills and patient care" },
  { value: "ADMINISTRATIVE", label: "Administrative Supervisor", description: "Oversees administrative duties and compliance" },
  { value: "PRECEPTOR", label: "Preceptor", description: "Guides new staff during orientation period" },
  { value: "MENTOR", label: "Mentor", description: "Provides career guidance and professional development" },
];

const FREQUENCY_OPTIONS: { value: SupervisionFrequency; label: string }[] = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Bi-weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "AS_NEEDED", label: "As Needed" },
];

const DISCIPLINE_OPTIONS = [
  "Nursing",
  "Physical Therapy",
  "Occupational Therapy",
  "Speech Therapy",
  "Home Health Aide",
  "Medical Social Work",
  "Other",
];

export default function NewRelationshipPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    supervisorId: "",
    superviseeId: "",
    relationshipType: "PRIMARY" as SupervisorType,
    discipline: "",
    customDiscipline: "",
    requiredVisitFrequency: "MONTHLY" as SupervisionFrequency,
    requiredHoursPerPeriod: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff?limit=100");
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();
      setStaff(data.staff || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const discipline = formData.discipline === "Other"
        ? formData.customDiscipline
        : formData.discipline;

      const payload = {
        supervisorId: formData.supervisorId,
        superviseeId: formData.superviseeId,
        relationshipType: formData.relationshipType,
        discipline: discipline || undefined,
        requiredVisitFrequency: formData.requiredVisitFrequency,
        requiredHoursPerPeriod: formData.requiredHoursPerPeriod
          ? parseFloat(formData.requiredHoursPerPeriod)
          : undefined,
      };

      const res = await fetch("/api/supervision/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create relationship");
      }

      router.push("/supervision");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = TYPE_OPTIONS.find(t => t.value === formData.relationshipType);

  // Filter out selected supervisor from supervisee options and vice versa
  const supervisorOptions = staff.filter(s => s.id !== formData.superviseeId);
  const superviseeOptions = staff.filter(s => s.id !== formData.supervisorId);

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/supervision"
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Supervision
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold text-gray-900">Add Supervisory Relationship</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a new supervisory relationship between staff members
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Supervisor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supervisor <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.supervisorId}
              onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a supervisor...</option>
              {supervisorOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} - {s.role.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Supervisee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supervisee <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.superviseeId}
              onChange={(e) => setFormData({ ...formData, superviseeId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a supervisee...</option>
              {superviseeOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} - {s.role.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Relationship Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TYPE_OPTIONS.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    formData.relationshipType === type.value
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="relationshipType"
                    value={type.value}
                    checked={formData.relationshipType === type.value}
                    onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value as SupervisorType })}
                    className="sr-only"
                  />
                  <div>
                    <span className="block text-sm font-medium text-gray-900">
                      {type.label}
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {type.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Discipline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discipline
            </label>
            <select
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a discipline (optional)...</option>
              {DISCIPLINE_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {formData.discipline === "Other" && (
              <input
                type="text"
                value={formData.customDiscipline}
                onChange={(e) => setFormData({ ...formData, customDiscipline: e.target.value })}
                placeholder="Enter discipline..."
                className="w-full mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          {/* Visit Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Visit Frequency <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.requiredVisitFrequency}
              onChange={(e) => setFormData({ ...formData, requiredVisitFrequency: e.target.value as SupervisionFrequency })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              How often supervision visits should occur
            </p>
          </div>

          {/* Required Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Hours Per Period
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={formData.requiredHoursPerPeriod}
              onChange={(e) => setFormData({ ...formData, requiredHoursPerPeriod: e.target.value })}
              placeholder="e.g., 2"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum supervision hours required per frequency period (optional)
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link
              href="/supervision"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !formData.supervisorId || !formData.superviseeId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Relationship"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
