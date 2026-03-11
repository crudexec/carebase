"use client";

import { memo } from "react";
import FormInput from "@/components/input-fields/FormInput";
import { ParentContactFormData, ContactFormData } from "@/utils/schemas";
import {
  FormCitySelect,
  FormCountrySelect,
  FormStateSelect,
} from "@/components/location-selectors";

const EmergencyContact = ({
  formData,
  handleChange,
  error,
  isViewing,
}: {
  formData: ParentContactFormData;
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement> | string,
    section: keyof ContactFormData,
    field: keyof ParentContactFormData
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
      data-testid="emergency-contact-section"
    >
      <h3
        className="text-[#0F172A] text-[24px] font-[600]"
        data-testid="emergency-contact-title"
      >
        Emergency Contact Information (Beside Parents)
      </h3>

      <form
        className="flex flex-col gap-7"
        data-testid="emergency-contact-form"
      >
        <div
          className="w-full flex flex-col xl:flex-row justify-between items-start gap-5"
          data-testid="emergency-name-row"
        >
          <FormInput
            name="emergencyfirstName"
            value={formData.contactFirstName}
            onChange={(e) =>
              handleChange(e, "emergencyContact", "contactFirstName")
            }
            placeholder="Enter contact's first name"
            type="text"
            labelText="Contact First Name"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Emergency Contact First")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Emergency Contact First")
              )
            }
            disabled={isViewing}
            data-testid="emergency-first-name-input"
          />
          <FormInput
            name="emergencylastName"
            value={formData.contactLastName}
            onChange={(e) =>
              handleChange(e, "emergencyContact", "contactLastName")
            }
            placeholder="Enter contact's last name"
            type="text"
            labelText="Contact Last Name"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Emergency Contact Last")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Emergency Contact Last")
              )
            }
            disabled={isViewing}
            data-testid="emergency-last-name-input"
          />
        </div>

        <div
          className="w-full flex flex-col xl:flex-row justify-between items-start gap-5"
          data-testid="emergency-relationship-email-row"
        >
          <FormInput
            name="emergencyrelationship"
            value={formData.relationship}
            onChange={(e) =>
              handleChange(e, "emergencyContact", "relationship")
            }
            placeholder="Enter contact's relationship"
            type="text"
            labelText="Relationship"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Emergency Relationship")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Emergency Relationship")
              )
            }
            disabled={isViewing}
            data-testid="emergency-relationship-input"
          />
          <FormInput
            name="emergencyemail"
            value={formData.email}
            onChange={(e) => handleChange(e, "emergencyContact", "email")}
            placeholder="Enter contact's email address"
            type="text"
            labelText="Email Address"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("emergency email")
            )}
            isError={
              !!error.field.find((field) => field.includes("emergency email"))
            }
            disabled={isViewing}
            data-testid="emergency-email-input"
          />
        </div>

        <FormInput
          name="emergencyaddress"
          value={formData.streetAddress}
          onChange={(e) => handleChange(e, "emergencyContact", "streetAddress")}
          placeholder="Enter contact address"
          type="text"
          labelText="Street Number & House Address"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Emergency Street Number")
          )}
          isError={
            !!error.field.find((field) =>
              field.includes("Emergency Street Number")
            )
          }
          disabled={isViewing}
          data-testid="emergency-address-input"
        />

        <div
          className="w-full flex flex-col xl:flex-row justify-between items-start gap-5"
          data-testid="emergency-country-state-row"
        >
          <FormCountrySelect
            name="emergencycountry"
            label="Select Country"
            defaultValue={formData.country}
            value={formData.country}
            onCountryChange={(e) =>
              handleChange(e, "emergencyContact", "country")
            }
            errorMessage={error.message.find((message) =>
              message.includes("Emergency Country")
            )}
            isError={
              !!error.field.find((field) => field.includes("Emergency Country"))
            }
            disabled={isViewing}
            data-testid="emergency-country-select"
          />

          <FormStateSelect
            name="emergencystate"
            label="Select State"
            value={formData.state}
            onStateChange={(e) => handleChange(e, "emergencyContact", "state")}
            errorMessage={error.message.find((message) =>
              message.includes("Emergency State")
            )}
            isError={
              !!error.field.find((field) => field.includes("Emergency State"))
            }
            disabled={isViewing}
            countryCode={formData.country}
            data-testid="emergency-state-select"
          />
        </div>

        <div
          className="w-full flex flex-col flex-wrap xl:flex-nowrap xl:flex-row justify-between items-start gap-5"
          data-testid="emergency-city-apartment-zip-row"
        >
          <FormCitySelect
            name="emergencycity"
            value={formData.city}
            onCityChange={(e) => handleChange(e, "emergencyContact", "city")}
            label="City or town"
            // isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Emergency City")
            )}
            isError={
              !!error.field.find((field) => field.includes("Emergency City"))
            }
            disabled={isViewing}
            countryCode={formData.country}
            stateCode={formData.state}
            data-testid="emergency-city-select"
          />
          <FormInput
            name="emergencyapartmentNumber"
            value={formData.apartmentNumber}
            onChange={(e) =>
              handleChange(e, "emergencyContact", "apartmentNumber")
            }
            placeholder="Enter apartment no."
            type="text"
            labelText="Apartment Number"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Emergency Apartment Number")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Emergency Apartment Number")
              )
            }
            disabled={isViewing}
            data-testid="emergency-apartment-number-input"
          />
          <FormInput
            name="emergencyzipCode"
            value={formData.zipCode}
            onChange={(e) => handleChange(e, "emergencyContact", "zipCode")}
            placeholder="Enter zip code"
            type="text"
            labelText="Zip Code"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Emergency Zip Code")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Emergency Zip Code")
              )
            }
            disabled={isViewing}
            data-testid="emergency-zip-code-input"
          />
        </div>

        <div
          className="w-full flex flex-col flex-wrap xl:flex-nowrap xl:flex-row justify-between items-start gap-5"
          data-testid="emergency-phones-row"
        >
          <FormInput
            name="emergencycellPhone"
            value={formData.cellPhone}
            onChange={(e) => handleChange(e, "emergencyContact", "cellPhone")}
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Cell Phone"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Emergency Cell")
            )}
            isError={
              !!error.field.find((field) => field.includes("Emergency Cell"))
            }
            disabled={isViewing}
            data-testid="emergency-cell-phone-input"
          />
          <FormInput
            name="emergencyhomePhone"
            value={formData.homePhone}
            onChange={(e) => handleChange(e, "emergencyContact", "homePhone")}
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Home Phone"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Emergency Home")
            )}
            isError={
              !!error.field.find((field) => field.includes("Emergency Home"))
            }
            disabled={isViewing}
            data-testid="emergency-home-phone-input"
          />
          <FormInput
            name="emergencyworkPhone"
            value={formData.workPhone}
            onChange={(e) => handleChange(e, "emergencyContact", "workPhone")}
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Work Phone"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Emergency Work")
            )}
            isError={
              !!error.field.find((field) => field.includes("Emergency Work"))
            }
            disabled={isViewing}
            data-testid="emergency-work-phone-input"
          />
        </div>
      </form>
    </section>
  );
};

export default memo(EmergencyContact);
