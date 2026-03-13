"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Building2, AlertCircle, CheckCircle, UserPlus } from "lucide-react";

interface InviteInfo {
  token: string;
  email: string | null;
  role: string;
  expiresAt: string;
  company: {
    id: string;
    name: string;
  };
}

function InviteRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Validate the invite token
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setValidationError("No invite token provided");
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/invites/validate?token=${token}`);
        const data = await response.json();

        if (!data.valid) {
          setValidationError(data.error || "Invalid invite");
          setIsValidating(false);
          return;
        }

        setInvite(data.invite);
        // Pre-fill email if the invite is for a specific email
        if (data.invite.email) {
          setFormData((prev) => ({ ...prev, email: data.invite.email }));
        }
      } catch {
        setValidationError("Failed to validate invite");
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    // Client-side validation
    const validationErrors: string[] = [];

    if (formData.password !== formData.confirmPassword) {
      validationErrors.push("Passwords do not match");
    }

    if (formData.password.length < 8) {
      validationErrors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(formData.password)) {
      validationErrors.push("Password must contain an uppercase letter");
    }

    if (!/[a-z]/.test(formData.password)) {
      validationErrors.push("Password must contain a lowercase letter");
    }

    if (!/[0-9]/.test(formData.password)) {
      validationErrors.push("Password must contain a number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      validationErrors.push("Password must contain a special character");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || [data.error || "Registration failed"]);
        setIsLoading(false);
        return;
      }

      // Redirect to login with success message
      router.push("/login?registered=true");
    } catch {
      setErrors(["An error occurred. Please try again."]);
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-foreground-secondary">Validating invite...</p>
        </div>
      </main>
    );
  }

  // Invalid token state
  if (validationError || !invite) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Invalid Invitation</h2>
                <p className="text-sm text-foreground-secondary mb-6">
                  {validationError || "This invitation link is not valid."}
                </p>
                <Link href="/login">
                  <Button variant="secondary" className="w-full">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md animate-slideUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-heading-1 text-foreground">CareBase</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Care Agency Management System
          </p>
        </div>

        {/* Invite Info */}
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">{invite.company.name}</span>
          </div>
          <p className="text-xs text-blue-700">
            You've been invited to join as <strong>{invite.role.replace("_", " ")}</strong>
          </p>
        </div>

        {/* Register Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Complete your registration to join {invite.company.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="p-3 rounded-md bg-error/20 text-body-sm">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" required>
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" required>
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" required>
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  disabled={!!invite.email}
                />
                {invite.email && (
                  <p className="text-xs text-foreground-tertiary flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    This invite is specifically for this email
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" required>
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <p className="text-caption text-foreground-tertiary">
                  Min 8 chars, uppercase, lowercase, number, special character
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" required>
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            {/* Login Link */}
            <p className="text-center text-body-sm text-foreground-secondary mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-foreground hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-caption text-foreground-tertiary mt-6">
          Protected by CareBase Security
        </p>
      </div>
    </main>
  );
}

export default function InviteRegistrationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-6 bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      }
    >
      <InviteRegistrationContent />
    </Suspense>
  );
}
