import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
export default async function ChecklistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { checklistsEnabled: true },
  });
  if (!company?.checklistsEnabled)
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Checklists</h1>
        <p>Checklists are disabled for your company.</p>
        {session.user.role === "ADMIN" && (
          <Link className="text-primary" href="/settings">
            Enable in Settings
          </Link>
        )}
      </div>
    );
  return children;
}
