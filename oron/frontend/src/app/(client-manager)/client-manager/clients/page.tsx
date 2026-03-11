import PageContainer from "@/components/PageContainer";
import ClientsPageWrapper from "@/components/clients/ClientsPageWrapper";

const ClientManagerClientsPage = () => {
  return (
    <PageContainer>
      <ClientsPageWrapper admin={true} clientManager={true} />
    </PageContainer>
  );
};

export default ClientManagerClientsPage;
