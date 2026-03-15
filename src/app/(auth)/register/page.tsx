"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Mail } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // Auto-redirect to login after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 10000);
    return () => clearTimeout(timer);
  }, [router]);

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

        {/* Registration Disabled Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Invitation Only
              </h2>
              <p className="text-sm text-foreground-secondary mb-6">
                CareBase registration is by invitation only. If you've received an invite link, please use that to create your account.
              </p>

              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full">
                    Go to Login
                  </Button>
                </Link>

                <div className="flex items-center gap-2 justify-center text-xs text-foreground-tertiary">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact your administrator for an invite</span>
                </div>
              </div>
            </div>
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
