import Header from "@/components/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import ProtectedRoute from "../../route-protection/protected-route";
import { SidebarProvider } from "@/app/(dashboard)/sidebar-context";
import ClientDetailsProtectedRoute from "../../route-protection/client-details-protected-route";
import { EventProvider } from "@/components/events/event-context";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <ClientDetailsProtectedRoute>
        <SidebarProvider>
          <EventProvider>
            <div className="flex h-full bg-white">
              <Sidebar />
              <div className="flex-1 w-full min-h-screen overflow-x-hidden lg:pl-[280px]">
                <Header />
                <main className="pt-[70px]">{children}</main>
              </div>
            </div>
          </EventProvider>
        </SidebarProvider>
      </ClientDetailsProtectedRoute>
    </ProtectedRoute>
  );
}
