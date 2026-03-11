import OfferLetterPageWrapper from "@/components/forms/offer-letter/OfferLetterPageWrapper";
import PageContainer from "@/components/PageContainer";
import OfferLetterProtectedRoute from "./offer-letter-protected-route";

const OfferLetterPage = () => {
  return (
    <OfferLetterProtectedRoute>
      <PageContainer>
        <OfferLetterPageWrapper />
      </PageContainer>
    </OfferLetterProtectedRoute>
  );
};

export default OfferLetterPage;
