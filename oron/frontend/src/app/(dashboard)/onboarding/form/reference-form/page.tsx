import { ReferenceForm } from "@/components/forms/reference-form";
import PageContainer from "@/components/PageContainer";
import BreadCrumb from "@/components/BreadCrumb";

const ReferenceFormPage = () => {
  return (
    <PageContainer>
      <BreadCrumb
        links={[
          {
            name: "Forms",
            route: "/onboarding/form",
          },
          {
            name: "Reference Form",
            route: "/onboarding/form/reference-form",
          },
        ]}
      />

      <ReferenceForm />
    </PageContainer>
  );
};

export default ReferenceFormPage;
