import { redirect } from "next/navigation";

import LoginForm from "@/components/login";
import { ModeToggle } from "@/components/ui";
import { getServerSession } from "@/lib";
import { PageProps } from "@/types";

export default async function Login({ searchParams }: PageProps) {
  const user = await getServerSession();
  if (user && !searchParams?.action) {
    redirect("/dashboard"); // Redirect to dashboard instead of testing homepage
  }
  return (
    <div className="relative h-screen flex items-center justify-center p-3">
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>
      <LoginForm />
    </div>
  );
}
