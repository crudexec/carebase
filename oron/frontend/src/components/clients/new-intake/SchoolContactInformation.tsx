"use client";

import { memo } from "react";
import FormInput from "@/components/input-fields/FormInput";
import { SchoolContactFormData, ContactFormData } from "@/utils/schemas";

const SchoolContactInformation = ({
  formData,
  handleChange,
  error,
  isViewing,
}: {
  formData: SchoolContactFormData;
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement> | string,
    section: keyof ContactFormData,
    field: keyof SchoolContactFormData
  ) => void;
  error: {
    field: string[];
    message: string[];
  };
  isViewing?: boolean;
}) => {
  return (
    <section
      className="flex-1 h-fit flex flex-col gap-10 border-[1px] border-[#EAECF0] shadow-md p-5 rounded-[12px]"
      data-testid="school-contact-section"
    >
      <h3
        className="text-[#0F172A] text-[24px] font-[600]"
        data-testid="school-contact-title"
      >
        School Contact Information
      </h3>

      <form className="flex flex-col gap-7" data-testid="school-contact-form">
        <FormInput
          name="nameOfSchool"
          value={formData.nameOfSchool}
          onChange={(e) => handleChange(e, "schoolContact", "nameOfSchool")}
          placeholder="Enter name of participant's school"
          type="text"
          labelText="Name Of School"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Name of School")
          )}
          isError={
            !!error.field.find((field) => field.includes("Name of School"))
          }
          disabled={isViewing}
          data-testid="school-name-input"
        />
        <FormInput
          name="schoolAddress"
          value={formData.schoolAddress}
          onChange={(e) => handleChange(e, "schoolContact", "schoolAddress")}
          placeholder="Enter school address"
          type="text"
          labelText="School Address"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("School Address")
          )}
          isError={
            !!error.field.find((field) => field.includes("School Address"))
          }
          disabled={isViewing}
          data-testid="school-address-input"
        />
        <div
          className="w-full flex flex-col xl:flex-row justify-between items-start gap-5"
          data-testid="school-telephone-email-row"
        >
          <FormInput
            name="schooltelePhone"
            value={formData.telephone}
            onChange={(e) => handleChange(e, "schoolContact", "telephone")}
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Telephone"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Telephone")
            )}
            isError={!!error.field.find((field) => field.includes("Telephone"))}
            disabled={isViewing}
            data-testid="school-telephone-input"
          />
          <FormInput
            name="schoolemail"
            value={formData.emailAddress}
            onChange={(e) => handleChange(e, "schoolContact", "emailAddress")}
            placeholder="Enter school contact's email address"
            type="text"
            labelText="Email Address"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("school email")
            )}
            isError={
              !!error.field.find((field) => field.includes("school email"))
            }
            disabled={isViewing}
            data-testid="school-email-input"
          />
        </div>
        <FormInput
          name="schoolcontactPerson"
          value={formData.contactPerson}
          onChange={(e) => handleChange(e, "schoolContact", "contactPerson")}
          placeholder="Enter contact person's full name"
          type="text"
          labelText="Contact Person"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Contact Person")
          )}
          isError={
            !!error.field.find((field) => field.includes("Contact Person"))
          }
          disabled={isViewing}
          data-testid="school-contact-person-input"
        />
      </form>
    </section>
  );
};

export default memo(SchoolContactInformation);
