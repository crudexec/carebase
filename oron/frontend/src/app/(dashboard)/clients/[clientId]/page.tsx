import ClientDetailPageWrapper from "@/components/clients/client-details/ClientDetailPageWrapper";
import PageContainer from "@/components/PageContainer";

const ClientDetailPage = () => {
  return (
    <PageContainer>
      <ClientDetailPageWrapper admin={false} />
    </PageContainer>
  );
};

export default ClientDetailPage;
