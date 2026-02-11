"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TokenData {
  valid: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  companyName?: string;
  error?: string;
}

export function SponsorInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenError("No invitation token provided");
      setIsValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/sponsors/invite/accept?token=${token}`);
        const data = await response.json();

        if (!data.valid) {
          setTokenError(data.error || "Invalid or expired invitation link");
        } else {
          setTokenData(data);
        }
      } catch {
        setTokenError("Failed to validate invitation link");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/sponsors/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md text-center">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-8" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
          <p className="text-sm text-foreground-secondary mt-4">
            Validating invitation...
          </p>
        </div>
      </main>
    );
  }

  // Invalid token state
  if (tokenError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md animate-slideUp">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground">CareBase</h1>
            <p className="text-sm text-foreground-secondary mt-1">
              Family Sponsor Portal
            </p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Invitation invalid</CardTitle>
              <CardDescription>
                This invitation link is no longer valid
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-md bg-error-light text-sm text-red-800">
                {tokenError}
              </div>
              <p className="text-sm text-foreground-secondary text-center">
                Please contact the care agency to request a new invitation.
              </p>
              <Link href="/login">
                <Button variant="secondary" className="w-full">
                  Go to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-foreground-tertiary mt-6">
            Protected by CareBase Security
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md animate-slideUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground">CareBase</h1>
          <p className="text-sm text-foreground-secondary mt-1">
            Family Sponsor Portal
          </p>
        </div>

        {/* Accept Invitation Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              {success ? "Welcome to CareBase!" : "Create Your Account"}
            </CardTitle>
            <CardDescription>
              {success ? (
                "Your account has been created"
              ) : (
                <>
                  Hi {tokenData?.firstName}, you&apos;ve been invited to join{" "}
                  <strong>{tokenData?.companyName}</strong> on CareBase
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-success-light text-sm text-green-800">
                  <p className="font-medium">Account created successfully!</p>
                  <p className="mt-1">
                    You can now sign in to view care updates, visit notes, and more.
                  </p>
                </div>
                <p className="text-sm text-foreground-secondary text-center">
                  Redirecting to sign in...
                </p>
                <Link href="/login">
                  <Button className="w-full">Sign in now</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-md bg-error-light text-sm text-red-800">
                    {error}
                  </div>
                )}

                {/* Email Display (read-only) */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={tokenData?.email || ""}
                    disabled
                    className="bg-background-tertiary"
                  />
                </div>

                {/* Name Display (read-only) */}
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={`${tokenData?.firstName || ""} ${tokenData?.lastName || ""}`}
                    disabled
                    className="bg-background-tertiary"
                  />
                </div>

                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" required>
                    Create Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    error={!!error}
                  />
                  <p className="text-xs text-foreground-secondary">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" required>
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    error={!!error || (!!confirmPassword && password !== confirmPassword)}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || (!!confirmPassword && password !== confirmPassword)}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>

                {/* Already have account Link */}
                <p className="text-center text-sm text-foreground-secondary">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-foreground hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-foreground-tertiary mt-6">
          Protected by CareBase Security
        </p>
      </div>
    </main>
  );
}
