"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import SignaturePad from "signature_pad";

interface SignatureRequest {
  id: string;
  signerType: string;
  signerName: string;
  signerEmail: string;
  expiresAt: string;
  status: string;
  customMessage?: string;
}

interface CarePlan {
  id: string;
  planNumber: string;
  templateName: string;
  templateDescription?: string;
  effectiveDate: string | null;
  endDate: string | null;
  summary: string | null;
  goals: unknown;
  interventions: unknown;
  frequency: unknown;
  formSchemaSnapshot: unknown;
  formData: unknown;
  client: {
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
  };
  company: {
    name: string;
    phone: string | null;
    address: string | null;
  };
  createdBy: string | null;
  createdAt: string;
}

interface SignatureData {
  signatureRequest: SignatureRequest;
  carePlan: CarePlan;
  alreadySigned: boolean;
}

const signerTypeLabels: Record<string, string> = {
  PARENT: "Parent/Guardian",
  GUARDIAN: "Legal Guardian",
  PHYSICIAN: "Physician",
  SERVICE_COORDINATOR: "Service Coordinator",
  THERAPIST: "Therapist",
  CASE_MANAGER: "Case Manager",
  OTHER: "Authorized Signer",
};

export default function SignPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [data, setData] = useState<SignatureData | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [signerRelation, setSignerRelation] = useState("");
  const [signerCredentials, setSignerCredentials] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  // Fetch the signature request data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/sign/${token}`);
        const result = await response.json();

        if (!response.ok) {
          if (result.expired) {
            setExpired(true);
          }
          setError(result.error || "Failed to load document");
          return;
        }

        if (result.alreadySigned) {
          setAlreadySigned(true);
          setSignedAt(result.signedAt);
          return;
        }

        setData(result);
      } catch (err) {
        console.error("Error fetching signature data:", err);
        setError("Failed to load document. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchData();
    }
  }, [token]);

  // Initialize signature pad
  useEffect(() => {
    if (canvasRef.current && data && !alreadySigned) {
      const canvas = canvasRef.current;
      // Set canvas size
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);

      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
      });
    }
  }, [data, alreadySigned]);

  const clearSignature = () => {
    signaturePadRef.current?.clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      alert("Please provide your signature");
      return;
    }

    if (!consentConfirmed) {
      alert("Please confirm that you have reviewed and agree to the document");
      return;
    }

    setSubmitting(true);

    try {
      const signatureData = signaturePadRef.current.toDataURL();

      const response = await fetch(`/api/sign/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signatureData,
          signerRelation,
          signerCredentials,
          consentConfirmed,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit signature");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting signature:", err);
      alert(err instanceof Error ? err.message : "Failed to submit signature");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {expired ? "Link Expired" : "Unable to Load Document"}
          </h1>
          <p className="text-gray-600">{error}</p>
          {expired && (
            <p className="mt-4 text-sm text-gray-500">
              Please contact the provider to request a new signature link.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Already signed state
  if (alreadySigned) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Document Already Signed
          </h1>
          <p className="text-gray-600">
            This document was signed on{" "}
            {signedAt ? new Date(signedAt).toLocaleDateString() : "a previous date"}.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            If you need to make changes, please contact the provider.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Signature Submitted Successfully
          </h1>
          <p className="text-gray-600">
            Thank you for signing the document. The provider has been notified.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            You may now close this window.
          </p>
        </div>
      </div>
    );
  }

  // Main signing view
  if (!data) {
    return null;
  }

  const { signatureRequest, carePlan } = data;
  const isPhysician = signatureRequest.signerType === "PHYSICIAN";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Review & Sign Document
              </h1>
              <p className="text-gray-600 mt-1">
                {carePlan.company.name}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {signerTypeLabels[signatureRequest.signerType] || signatureRequest.signerType}
              </span>
            </div>
          </div>

          {signatureRequest.customMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Message from provider:</strong> {signatureRequest.customMessage}
              </p>
            </div>
          )}
        </div>

        {/* Care Plan Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            Care Plan Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-500">Client Name</label>
              <p className="font-medium">
                {carePlan.client.firstName} {carePlan.client.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Plan Number</label>
              <p className="font-medium">{carePlan.planNumber}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Plan Type</label>
              <p className="font-medium">{carePlan.templateName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Date of Birth</label>
              <p className="font-medium">
                {carePlan.client.dateOfBirth
                  ? new Date(carePlan.client.dateOfBirth).toLocaleDateString()
                  : "Not specified"}
              </p>
            </div>
            {carePlan.effectiveDate && (
              <div>
                <label className="text-sm text-gray-500">Effective Date</label>
                <p className="font-medium">
                  {new Date(carePlan.effectiveDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {carePlan.endDate && (
              <div>
                <label className="text-sm text-gray-500">End Date</label>
                <p className="font-medium">
                  {new Date(carePlan.endDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {carePlan.summary && (
            <div className="mb-6">
              <label className="text-sm text-gray-500">Summary</label>
              <p className="mt-1 text-gray-700 whitespace-pre-wrap">{carePlan.summary}</p>
            </div>
          )}

          {Array.isArray(carePlan.goals) && carePlan.goals.length > 0 && (
            <div className="mb-6">
              <label className="text-sm text-gray-500">Goals</label>
              <ul className="mt-1 list-disc list-inside text-gray-700">
                {carePlan.goals.map((goal, index) => (
                  <li key={index}>{String(goal)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Signature Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Your Signature
            </h2>

            <div className="mb-4">
              <label className="text-sm text-gray-500">Signing as</label>
              <p className="font-medium">{signatureRequest.signerName}</p>
              <p className="text-sm text-gray-500">{signatureRequest.signerEmail}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship to Client
              </label>
              <input
                type="text"
                value={signerRelation}
                onChange={(e) => setSignerRelation(e.target.value)}
                placeholder="e.g., Mother, Father, Legal Guardian, Attending Physician"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {isPhysician && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credentials (NPI, License Number)
                </label>
                <input
                  type="text"
                  value={signerCredentials}
                  onChange={(e) => setSignerCredentials(e.target.value)}
                  placeholder="e.g., NPI: 1234567890, MD License: 12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature
              </label>
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full"
                  style={{ height: "150px", touchAction: "none" }}
                />
              </div>
              <button
                type="button"
                onClick={clearSignature}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Signature
              </button>
            </div>

            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I have reviewed the care plan above and agree to its contents. I understand
                  that my electronic signature is legally binding and equivalent to a handwritten
                  signature.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Signature"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            This signature request expires on{" "}
            {new Date(signatureRequest.expiresAt).toLocaleDateString()}.
          </p>
          <p className="mt-1">
            If you have questions, please contact {carePlan.company.name}
            {carePlan.company.phone && ` at ${carePlan.company.phone}`}.
          </p>
        </div>
      </div>
    </div>
  );
}
