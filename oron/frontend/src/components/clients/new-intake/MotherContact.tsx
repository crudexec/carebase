"use client";

import { memo } from "react";
import FormInput from "@/components/input-fields/FormInput";
import { ParentContactFormData, ContactFormData } from "@/utils/schemas";
import {
  FormCitySelect,
  FormCountrySelect,
  FormStateSelect,
} from "@/components/location-selectors";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const MotherContact = ({
  formData,
  handleChange,
  error,
  isViewing,
  prefillMotherAddressWithIntake,
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
  prefillMotherAddressWithIntake: (state: boolean) => void;
}) => {
  return (
    <form className="flex-1 h-fit flex flex-col gap-10 border-[1px] border-[#EAECF0] shadow-md p-5 rounded-[12px]">
      <h3
        data-testid="mother-contact-info-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Mother Contact Information
      </h3>

      <div className="flex gap-5 items-center">
        <Switch
          id="prefillMotherAddress"
          onCheckedChange={(state) => prefillMotherAddressWithIntake(state)}
          disabled={isViewing}
          data-testid="mother-prefill-address-switch"
        />
        <Label
          htmlFor="prefillMotherAddress"
          className="text-[14px] font-[500]"
          data-testid="mother-prefill-address-label"
        >
          Same address with intake
        </Label>
      </div>

      <div className="flex flex-col gap-7">
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormInput
            name="motherfirstName"
            value={formData.contactFirstName}
            onChange={(e) =>
              handleChange(e, "motherContact", "contactFirstName")
            }
            placeholder="Enter mother contact's first name"
            type="text"
            labelText="Contact First Name"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Mother Contact First")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Mother Contact First")
              )
            }
            disabled={isViewing}
            data-testid="mother-first-name-input"
          />
          <FormInput
            name="motherlastName"
            value={formData.contactLastName}
            onChange={(e) =>
              handleChange(e, "motherContact", "contactLastName")
            }
            placeholder="Enter mother contact's last name"
            type="text"
            labelText="Contact Last Name"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Mother Contact Last")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Mother Contact Last")
              )
            }
            disabled={isViewing}
            data-testid="mother-last-name-input"
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormInput
            name="motherrelationship"
            value={formData.relationship}
            onChange={(e) => handleChange(e, "motherContact", "relationship")}
            placeholder="Enter mother contact's relationship"
            type="text"
            labelText="Relationship"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Mother Relationship")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Mother Relationship")
              )
            }
            disabled={isViewing}
            data-testid="mother-relationship-input"
          />
          <FormInput
            name="motheremail"
            value={formData.email}
            onChange={(e) => handleChange(e, "motherContact", "email")}
            placeholder="Enter mother contact's email address"
            type="text"
            labelText="Email Address"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("mother email")
            )}
            isError={
              !!error.field.find((field) => field.includes("mother email"))
            }
            disabled={isViewing}
            data-testid="mother-email-input"
          />
        </div>

        <FormInput
          name="motheraddress"
          value={formData.streetAddress}
          onChange={(e) => handleChange(e, "motherContact", "streetAddress")}
          placeholder="Enter mother contact address"
          type="text"
          labelText="Street Number & House Address"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Mother Street Number")
          )}
          isError={
            !!error.field.find((field) =>
              field.includes("Mother Street Number")
            )
          }
          disabled={isViewing}
          data-testid="mother-address-input"
        />

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormCountrySelect
            name="mothercountry"
            label="Select Country"
            defaultValue={formData.country}
            value={formData.country}
            onCountryChange={(e: string) => {
              handleChange(e, "motherContact", "country");
            }}
            errorMessage={error.message.find((message) =>
              message.includes("Mother Country")
            )}
            isError={
              !!error.field.find((field) => field.includes("Mother Country"))
            }
            disabled={isViewing}
            data-testid="mother-country-select"
          />

          <FormStateSelect
            name="motherstate"
            label="Select State"
            defaultValue={formData.state}
            value={formData.state}
            onStateChange={(e) => handleChange(e, "motherContact", "state")}
            errorMessage={error.message.find((message) =>
              message.includes("Mother State")
            )}
            isError={
              !!error.field.find((field) => field.includes("Mother State"))
            }
            disabled={isViewing}
            countryCode={formData.country}
            data-testid="mother-state-select"
          />
        </div>

        <div className="w-full flex flex-col flex-wrap xl:flex-nowrap xl:flex-row justify-between items-start gap-5">
          <FormCitySelect
            name="mothercity"
            value={formData.city}
            onCityChange={(e) => handleChange(e, "motherContact", "city")}
            label="City or town"
            errorMessage={error.message.find((message) =>
              message.includes("Mother City")
            )}
            isError={
              !!error.field.find((field) => field.includes("Mother City"))
            }
            disabled={isViewing}
            countryCode={formData.country}
            stateCode={formData.state}
            data-testid="mother-city-select"
          />

          <FormInput
            name="motherapartmentNumber"
            value={formData.apartmentNumber}
            onChange={(e) =>
              handleChange(e, "motherContact", "apartmentNumber")
            }
            placeholder="Enter apartment no."
            type="text"
            labelText="Apartment Number"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Mother Apartment Number")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Mother Apartment Number")
              )
            }
            disabled={isViewing}
            data-testid="mother-apartment-number-input"
          />
          <FormInput
            name="motherzipCode"
            value={formData.zipCode}
            onChange={(e) => handleChange(e, "motherContact", "zipCode")}
            placeholder="Enter zip code"
            type="text"
            labelText="Zip Code"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Mother Zip Code")
            )}
            isError={
              !!error.field.find((field) => field.includes("Mother Zip Code"))
            }
            disabled={isViewing}
            data-testid="mother-zip-code-input"
          />
        </div>

        <div className="w-full flex flex-col flex-wrap xl:flex-nowrap xl:flex-row justify-between items-start gap-5">
          <FormInput
            name="mothercellPhone"
            value={formData.cellPhone}
            onChange={(e) => handleChange(e, "motherContact", "cellPhone")}
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Cell Phone"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Mother Cell")
            )}
            isError={
              !!error.field.find((field) => field.includes("Mother Cell"))
            }
            disabled={isViewing}
            data-testid="mother-cell-phone-input"
          />
          <FormInput
            name="motherhomePhone"
            value={formData.homePhone}
            onChange={(e) => handleChange(e, "motherContact", "homePhone")}
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Home Phone"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Mother Home")
            )}
            isError={
              !!error.field.find((field) => field.includes("Mother Home"))
            }
            disabled={isViewing}
            data-testid="mother-home-phone-input"
          />
          <FormInput
            name="motherworkPhone"
            value={formData.workPhone}
            onChange={(e) => handleChange(e, "motherContact", "workPhone")}
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Work Phone"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Mother Work")
            )}
            isError={
              !!error.field.find((field) => field.includes("Mother Work"))
            }
            disabled={isViewing}
            data-testid="mother-work-phone-input"
          />
        </div>
      </div>
    </form>
  );
};

export default memo(MotherContact);
