import { Suspense } from "react";
import { SponsorInviteForm } from "./sponsor-invite-form";

export const metadata = {
  title: "Accept Invitation - CareBase",
  description: "Create your sponsor account",
};

export default function SponsorInvitePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-md text-center">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-8" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
            <p className="text-sm text-foreground-secondary mt-4">Loading...</p>
          </div>
        </main>
      }
    >
      <SponsorInviteForm />
    </Suspense>
  );
}
