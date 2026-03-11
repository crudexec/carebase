"use client";

import EditAccountDetails from "@/components/settings/EditAccountDetails";
import EditPassword from "@/components/settings/EditPassword";
import PageContainer from "@/components/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminSettingsPage = () => {
  return (
    <PageContainer>
      <section className="flex flex-col gap-10">
        <h1 className="text-[20px] sm:text-[25px] md:text-[36px] font-[600] text-[#0F172A]">
          Settings
        </h1>

        <Tabs defaultValue="account" className="w-full">
          <TabsList>
            <TabsTrigger value="account">My Details</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <EditAccountDetails />
          </TabsContent>
          <TabsContent value="password">
            <EditPassword />
          </TabsContent>
        </Tabs>
      </section>
    </PageContainer>
  );
};

export default AdminSettingsPage;
