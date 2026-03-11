import Header from "@/components/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import ProtectedRoute from "../../route-protection/protected-route";
import { SidebarProvider } from "@/app/(dashboard)/sidebar-context";

export default function EmployeeManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute employeeManager>
      <SidebarProvider>
        <div className="flex h-full min-h-screen bg-white">
          <Sidebar isEmployeeManager={true} />
          <div className="flex-1 w-full min-h-screen overflow-x-hidden lg:pl-[280px]">
            <Header />
            <main className="pt-[70px]">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
