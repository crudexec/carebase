"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  CompetencyCategory,
  CompetencyAssessmentMethod,
  UserRole,
} from "@prisma/client";

interface Competency {
  id: string;
  name: string;
  description: string | null;
  category: CompetencyCategory;
  assessmentMethod: CompetencyAssessmentMethod;
  passingScore: number | null;
  validityMonths: number;
  requiresRevalidation: boolean;
  prerequisiteIds: string[];
  requiredForRoles: UserRole[];
  requiredForServices: string[];
  isActive: boolean;
  createdAt: string;
  _count: {
    staffCompetencies: number;
    taskCompetencies: number;
  };
}

const CATEGORY_LABELS: Record<CompetencyCategory, string> = {
  CLINICAL_SKILLS: "Clinical Skills",
  MEDICATION_MANAGEMENT: "Medication Management",
  INFECTION_CONTROL: "Infection Control",
  SAFETY_PROCEDURES: "Safety Procedures",
  DOCUMENTATION: "Documentation",
  COMMUNICATION: "Communication",
  EQUIPMENT_OPERATION: "Equipment Operation",
  EMERGENCY_RESPONSE: "Emergency Response",
  PATIENT_RIGHTS: "Patient Rights",
  REGULATORY_COMPLIANCE: "Regulatory Compliance",
  SPECIALIZED_CARE: "Specialized Care",
};

const METHOD_LABELS: Record<CompetencyAssessmentMethod, string> = {
  DIRECT_OBSERVATION: "Direct Observation",
  SKILLS_DEMONSTRATION: "Skills Demonstration",
  WRITTEN_TEST: "Written Test",
  VERBAL_ASSESSMENT: "Verbal Assessment",
  SIMULATION: "Simulation",
  CASE_STUDY: "Case Study",
  PEER_REVIEW: "Peer Review",
  SUPERVISOR_EVALUATION: "Supervisor Evaluation",
  SELF_ASSESSMENT_WITH_VALIDATION: "Self-Assessment with Validation",
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  OPS_MANAGER: "Operations Manager",
  CLINICAL_DIRECTOR: "Clinical Director",
  STAFF: "Staff",
  SUPERVISOR: "Supervisor",
  CARER: "Caregiver",
  SPONSOR: "Sponsor",
};

export default function CompetenciesPage() {
  const { data: session } = useSession();
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("true");
  const [showModal, setShowModal] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "CLINICAL_SKILLS" as CompetencyCategory,
    assessmentMethod: "DIRECT_OBSERVATION" as CompetencyAssessmentMethod,
    passingScore: "",
    validityMonths: "12",
    requiresRevalidation: true,
    requiredForRoles: [] as UserRole[],
    isActive: true,
  });

  const fetchCompetencies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (filterActive) params.set("isActive", filterActive);

      const res = await fetch(`/api/competencies?${params}`);
      if (!res.ok) throw new Error("Failed to fetch competencies");
      const data = await res.json();
      setCompetencies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetencies();
  }, [filterCategory, filterActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        passingScore: formData.passingScore ? parseFloat(formData.passingScore) : undefined,
        validityMonths: parseInt(formData.validityMonths),
      };

      const url = editingCompetency
        ? `/api/competencies/${editingCompetency.id}`
        : "/api/competencies";
      const method = editingCompetency ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save competency");
      }

      setShowModal(false);
      setEditingCompetency(null);
      resetForm();
      fetchCompetencies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "CLINICAL_SKILLS",
      assessmentMethod: "DIRECT_OBSERVATION",
      passingScore: "",
      validityMonths: "12",
      requiresRevalidation: true,
      requiredForRoles: [],
      isActive: true,
    });
  };

  const openEditModal = (competency: Competency) => {
    setEditingCompetency(competency);
    setFormData({
      name: competency.name,
      description: competency.description || "",
      category: competency.category,
      assessmentMethod: competency.assessmentMethod,
      passingScore: competency.passingScore?.toString() || "",
      validityMonths: competency.validityMonths.toString(),
      requiresRevalidation: competency.requiresRevalidation,
      requiredForRoles: competency.requiredForRoles,
      isActive: competency.isActive,
    });
    setShowModal(true);
  };

  const handleRoleToggle = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      requiredForRoles: prev.requiredForRoles.includes(role)
        ? prev.requiredForRoles.filter((r) => r !== role)
        : [...prev.requiredForRoles, role],
    }));
  };

  const groupedCompetencies = competencies.reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = [];
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, Competency[]>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competency Library</h1>
          <p className="text-gray-600 mt-1">
            Define and manage staff competencies for Joint Commission compliance
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingCompetency(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Competency
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border rounded-lg px-3 py-2 w-48"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="border rounded-lg px-3 py-2 w-32"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
            <option value="">All</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading competencies...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedCompetencies).map(([category, comps]) => (
            <div key={category} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">
                  {CATEGORY_LABELS[category as CompetencyCategory]}
                </h2>
              </div>
              <div className="divide-y">
                {comps.map((comp) => (
                  <div
                    key={comp.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{comp.name}</span>
                        {!comp.isActive && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      {comp.description && (
                        <p className="text-sm text-gray-500 mt-1">{comp.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Method: {METHOD_LABELS[comp.assessmentMethod]}</span>
                        <span>Valid for: {comp.validityMonths} months</span>
                        {comp.passingScore && <span>Passing: {comp.passingScore}%</span>}
                        <span>{comp._count.staffCompetencies} staff assessed</span>
                      </div>
                      {comp.requiredForRoles.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          <span className="text-xs text-gray-500">Required for:</span>
                          {comp.requiredForRoles.map((role) => (
                            <span
                              key={role}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                            >
                              {ROLE_LABELS[role]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => openEditModal(comp)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(groupedCompetencies).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No competencies found. Click "Add Competency" to create one.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">
                {editingCompetency ? "Edit Competency" : "Add Competency"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as CompetencyCategory })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assessment Method *
                  </label>
                  <select
                    value={formData.assessmentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assessmentMethod: e.target.value as CompetencyAssessmentMethod,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    {Object.entries(METHOD_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity (months) *
                  </label>
                  <input
                    type="number"
                    value={formData.validityMonths}
                    onChange={(e) => setFormData({ ...formData, validityMonths: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    min="0"
                    max="100"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required for Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleToggle(role as UserRole)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.requiredForRoles.includes(role as UserRole)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.requiresRevalidation}
                    onChange={(e) =>
                      setFormData({ ...formData, requiresRevalidation: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Requires periodic revalidation</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCompetency(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingCompetency ? "Save Changes" : "Create Competency"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
