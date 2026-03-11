"use client";

import PageContainer from "@/components/PageContainer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BiodataSchema } from "./schema";
import { z } from "zod";
import FormField from "@/components/form-field/FormField";
import { Form } from "@/components/ui/form";
import Button from "@/components/button/Button";
import Loader from "@/components/Loader";
import FormDisabledModal from "@/components/forms/FormDisabledModal";
import FormBanner from "@/components/banner/FormBanner";
import useBiodataLogic from "./use-logic";
import FormGrid from "@/components/form-grid/FormGrid";
import FormSuggestionDialog from "@/components/FormSuggestionDialog";
import FormApprovedModal from "@/components/forms/FormApprovedModal";
import BreadCrumb from "@/components/BreadCrumb";

const BioDataFormPage = () => {
  const form = useForm<z.infer<typeof BiodataSchema>>({
    resolver: zodResolver(BiodataSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      socialSecurityNumber: "",
      middleName: undefined,
      otherLastName: undefined,
      apartmentNumber: undefined,
      npi: undefined,
      lba: undefined,
    },
  });

  const {
    userDataLoading,
    biodata,
    biodataLoading,
    requestMethod,
    isFormDisabled,
    onSubmit,
    openModal,
    closeModal,
    justSubmitted,
    isFormApproved,
    isFormAwaitingApproval,
  } = useBiodataLogic(form);

  return (
    <PageContainer>
      <BreadCrumb
        links={[
          {
            name: "Forms",
            route: "/onboarding/form",
          },
          {
            name: "Bio Data Form",
            route: "/onboarding/form/biodata",
          },
        ]}
      />

      {openModal && (
        <FormSuggestionDialog
          formName="Biodata Form"
          formId="biodata"
          openModal={openModal}
          closeModal={closeModal}
        />
      )}

      {biodataLoading || userDataLoading ? (
        <Loader />
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-10"
          >
            {isFormAwaitingApproval && !justSubmitted && <FormDisabledModal />}
            {isFormApproved && <FormApprovedModal formName="Biodata Form" />}

            {isFormAwaitingApproval &&
              !openModal &&
              biodata?.data.status !== "reviewed" && (
                <FormBanner
                  variant="success"
                  text="Your Bio-Data form has been successfully submitted. We'll notify you once it's approved."
                />
              )}

            {biodata?.data.status === "reviewed" && (
              <FormBanner variant="warning" text={biodata?.data.review_notes} />
            )}

            <div className="w-full flex justify-between items-center gap-5 flex-wrap">
              <h2 className="text-[30px] font-[600] text-[#101828]">
                Bio-data Form
              </h2>
              <Button
                isLoading={form.formState.isSubmitting}
                disabled={isFormDisabled}
                type="submit"
              >
                {requestMethod === "POST" ? "Submit" : "Update"}
              </Button>
            </div>

            <div className="w-full flex flex-col gap-7">
              <FormGrid>
                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="lastName"
                  label="Last Name (Family Name)"
                  placeholder="Enter your last name"
                />

                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="firstName"
                  label="First Name (Given Name)"
                  placeholder="Enter your first name"
                />
              </FormGrid>

              <FormGrid>
                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="middleName"
                  label="Middle initial (if any)"
                  placeholder="Enter your middle initial"
                />

                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="otherLastName"
                  label="Other last names used (If any)"
                  placeholder="Enter other last names used"
                />
              </FormGrid>

              <FormGrid>
                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="email"
                  label="Email Address"
                  placeholder="pietro.schirano@gmail.com"
                />

                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  withSelect
                  isPhoneNumber
                />
              </FormGrid>

              <FormField
                disabled={isFormDisabled}
                control={form.control}
                name="address"
                label="Address"
                placeholder="Enter your home address"
              />

              <FormGrid>
                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="apartmentNumber"
                  label="Apartment number (if any)"
                  placeholder="Enter apartment number"
                />

                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="state"
                  label="Select a state"
                  placeholder="Select a state"
                  isStateField
                />
              </FormGrid>

              <FormGrid>
                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="city"
                  label="Select a city"
                  placeholder="Select a city"
                  isCityField
                />

                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="zipCode"
                  label="Zip Code"
                  placeholder="Enter Zip Code"
                />
              </FormGrid>

              <FormGrid>
                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="npi"
                  label="NPI # (Optional)"
                  placeholder="Enter NPI Number here"
                />

                <FormField
                  disabled={isFormDisabled}
                  control={form.control}
                  name="lba"
                  label="LBA # (Optional)"
                  placeholder="Enter LBA Number here"
                />
              </FormGrid>

              <FormField
                disabled={isFormDisabled}
                control={form.control}
                name="socialSecurityNumber"
                label="US Social Security number"
                placeholder="Enter your US SSN"
                isSocialSecurityNumber
              />
            </div>

            <Button
              isLoading={form.formState.isSubmitting}
              disabled={isFormDisabled}
              type="submit"
            >
              {requestMethod === "POST" ? "Submit" : "Update"}
            </Button>
          </form>
        </Form>
      )}
    </PageContainer>
  );
};

export default BioDataFormPage;
