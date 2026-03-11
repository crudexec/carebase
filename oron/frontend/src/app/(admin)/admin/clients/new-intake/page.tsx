import PageContainer from "@/components/PageContainer";
import { VisitingFormProvider } from "@/components/clients/client-details/client-visits/visit-form/store/visiting-form-context";
import NewIntakePageWrapper from "@/components/clients/new-intake/NewIntakePageWrapper";

const AdminNewIntakePage = () => {
  return (
    <PageContainer>
      <VisitingFormProvider>
        <NewIntakePageWrapper admin={true} />
      </VisitingFormProvider>
    </PageContainer>
  );
};

export default AdminNewIntakePage;
