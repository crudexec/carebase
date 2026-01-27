import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { SessionProvider } from "@/components/providers/session-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch company name for sidebar
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { name: true },
  });

  return (
    <SessionProvider>
      <DashboardShell user={session.user} companyName={company?.name || "CareBase"}>
        {children}
      </DashboardShell>
    </SessionProvider>
  );
}
