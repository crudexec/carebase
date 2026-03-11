import ClientDetailPageWrapper from "@/components/clients/client-details/ClientDetailPageWrapper";
import PageContainer from "@/components/PageContainer";

const ClientManagerClientDetailPage = () => {
  return (
    <PageContainer>
      <ClientDetailPageWrapper admin={true} clientManager={true} />
    </PageContainer>
  );
};

export default ClientManagerClientDetailPage;
