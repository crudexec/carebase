import Header from "@/components/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import ProtectedRoute from "../../route-protection/protected-route";
import { SidebarProvider } from "@/app/(dashboard)/sidebar-context";
import { EventProvider } from "@/components/events/event-context";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute admin>
      <SidebarProvider>
        <EventProvider>
          <div className="flex h-full min-h-screen bg-white">
            <Sidebar isAdmin={true} />
            <div className="flex-1 w-full min-h-screen overflow-x-hidden lg:pl-[280px]">
              <Header />
              <main className="pt-[70px]">{children}</main>
            </div>
          </div>
        </EventProvider>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
