import ClientDetailPageWrapper from "@/components/clients/client-details/ClientDetailPageWrapper";
import PageContainer from "@/components/PageContainer";

const AdminClientDetailPage = () => {
  return (
    <PageContainer>
      <ClientDetailPageWrapper admin={true} />
    </PageContainer>
  );
};

export default AdminClientDetailPage;
