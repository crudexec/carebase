import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { SessionProvider } from "@/components/providers/session-provider";
import { TerminologyProvider } from "@/components/providers/terminology-provider";
import { TerminologySettings, validateTerminologySettings } from "@/lib/terminology";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch company name and terminology settings for sidebar
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { name: true, terminology: true },
  });

  // Validate and extract terminology settings
  const terminology = validateTerminologySettings(company?.terminology)
    ? (company?.terminology as TerminologySettings)
    : null;

  return (
    <SessionProvider>
      <TerminologyProvider initialSettings={terminology}>
        <DashboardShell user={session.user} companyName={company?.name || "CareBase"}>
          {children}
        </DashboardShell>
      </TerminologyProvider>
    </SessionProvider>
  );
}
