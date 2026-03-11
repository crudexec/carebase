import PageContainer from "@/components/PageContainer";
import ClientsPageWrapper from "@/components/clients/ClientsPageWrapper";

const AdminClientPage = () => {
  return (
    <PageContainer>
      <ClientsPageWrapper admin={true} />
    </PageContainer>
  );
};

export default AdminClientPage;
