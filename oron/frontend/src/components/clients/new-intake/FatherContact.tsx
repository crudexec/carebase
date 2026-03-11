"use client";

import { memo } from "react";
import FormInput from "@/components/input-fields/FormInput";
import { Switch } from "@/components/ui/switch";
import { ParentContactFormData, ContactFormData } from "@/utils/schemas";
import { Label } from "@/components/ui/label";
import {
  FormCitySelect,
  FormCountrySelect,
  FormStateSelect,
} from "@/components/location-selectors";

const FatherContact = ({
  formData,
  handleChange,
  error,
  prefillFatherAddressWithMotherAddress,
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
  prefillFatherAddressWithMotherAddress: (state: boolean) => void;
  isViewing?: boolean;
}) => {
  return (
    <section className="flex-1 h-fit flex flex-col gap-10 border-[1px] border-[#EAECF0] shadow-md p-5 rounded-[12px]">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Father Contact Information
      </h3>

      <div className="flex gap-5 items-center">
        <Switch
          id="prefillAddress"
          onCheckedChange={(state) =>
            prefillFatherAddressWithMotherAddress(state)
          }
          disabled={isViewing}
          data-testid="father-prefill-address-switch"
        />
        <Label htmlFor="prefillAddress" className="text-[14px] font-[500]">
          Same address with mother contact
        </Label>
      </div>

      <form className="flex flex-col gap-7">
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormInput
            name="fatherfirstName"
            value={formData.contactFirstName}
            onChange={(e) =>
              handleChange(e, "fatherContact", "contactFirstName")
            }
            placeholder="Enter father contact's first name"
            type="text"
            labelText="Contact First Name"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Father Contact First")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Father Contact First")
              )
            }
            disabled={isViewing}
            data-testid="father-contact-first-name"
          />
          <FormInput
            name="fatherlastName"
            value={formData.contactLastName}
            onChange={(e) =>
              handleChange(e, "fatherContact", "contactLastName")
            }
            placeholder="Enter father contact's last name"
            type="text"
            labelText="Contact Last Name"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Father Contact Last")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Father Contact Last")
              )
            }
            disabled={isViewing}
            data-testid="father-contact-last-name"
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormInput
            name="fatherrelationship"
            value={formData.relationship}
            onChange={(e) => handleChange(e, "fatherContact", "relationship")}
            placeholder="Enter father contact's relationship"
            type="text"
            labelText="Relationship"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Father Relationship")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Father Relationship")
              )
            }
            disabled={isViewing}
            data-testid="father-contact-relationship"
          />
          <FormInput
            name="fatheremail"
            value={formData.email}
            onChange={(e) => handleChange(e, "fatherContact", "email")}
            placeholder="Enter father contact's email address"
            type="text"
            labelText="Email Address"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("father email")
            )}
            isError={
              !!error.field.find((field) => field.includes("father email"))
            }
            disabled={isViewing}
            data-testid="father-contact-email"
          />
        </div>

        <FormInput
          name="fatheraddress"
          value={formData.streetAddress}
          onChange={(e) => handleChange(e, "fatherContact", "streetAddress")}
          placeholder="Enter father contact address"
          type="text"
          labelText="Street Number & House Address"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Father Street Number")
          )}
          isError={
            !!error.field.find((field) =>
              field.includes("Father Street Number")
            )
          }
          disabled={isViewing}
          data-testid="father-contact-address"
        />

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormCountrySelect
            name="fathercountry"
            label="Select Country"
            defaultValue={formData.country}
            value={formData.country}
            onCountryChange={(e: string) =>
              handleChange(e, "fatherContact", "country")
            }
            errorMessage={error.message.find((message) =>
              message.includes("Father Country")
            )}
            isError={
              !!error.field.find((field) => field.includes("Father Country"))
            }
            disabled={isViewing}
            data-testid="father-contact-country"
          />

          {/* <FormSelect
            name="fatherstate"
            labelText="Select State"
            placeholder="State"
            value={formData.state}
            onValueChange={(e) => handleChange(e, "fatherContact", "state")}
            errorMessage={error.message.find((message) =>
              message.includes("Father State")
            )}
            isError={
              !!error.field.find((field) => field.includes("Father State"))
            }
            selectContent={STATES}
            disabled={isViewing}
          /> */}

          <FormStateSelect
            name="fatherstate"
            label="Select State"
            value={formData.state}
            onStateChange={(e) => handleChange(e, "fatherContact", "state")}
            errorMessage={error.message.find((message) =>
              message.includes("Father State")
            )}
            isError={
              !!error.field.find((field) => field.includes("Father State"))
            }
            disabled={isViewing}
            countryCode={formData.country}
            data-testid="father-contact-state"
          />
        </div>

        <div className="w-full flex flex-col flex-wrap xl:flex-nowrap xl:flex-row justify-between items-start gap-5">
          <FormCitySelect
            countryCode={formData.country}
            stateCode={formData.state}
            name="fathercity"
            value={formData.city}
            onCityChange={(e: string) =>
              handleChange(e, "fatherContact", "city")
            }
            label="City or town"
            errorMessage={error.message.find((message) =>
              message.includes("Father City")
            )}
            isError={
              !!error.field.find((field) => field.includes("Father City"))
            }
            disabled={isViewing}
            data-testid="father-contact-city"
          />
          <FormInput
            name="fatherapartmentNumber"
            value={formData.apartmentNumber}
            onChange={(e) =>
              handleChange(e, "fatherContact", "apartmentNumber")
            }
            placeholder="Enter apartment no."
            type="text"
            labelText="Apartment Number"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Father Apartment Number")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Father Apartment Number")
              )
            }
            disabled={isViewing}
            data-testid="father-contact-apartment-number"
          />
          <FormInput
            name="fatherzipCode"
            value={formData.zipCode}
            onChange={(e) => handleChange(e, "fatherContact", "zipCode")}
            placeholder="Enter zip code"
            type="text"
            labelText="Zip Code"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Father Zip Code")
            )}
            isError={
              !!error.field.find((field) => field.includes("Father Zip Code"))
            }
            disabled={isViewing}
            data-testid="father-contact-zip-code"
          />
        </div>

        <div className="w-full flex flex-col flex-wrap xl:flex-nowrap xl:flex-row justify-between items-start gap-5">
          <FormInput
            name="fathercellPhone"
            value={formData.cellPhone}
            onChange={(e) => handleChange(e, "fatherContact", "cellPhone")}
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Cell Phone"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Father Cell")
            )}
            isError={
              !!error.field.find((field) => field.includes("Father Cell"))
            }
            disabled={isViewing}
            data-testid="father-contact-cell-phone"
          />
          <FormInput
            name="fatherhomePhone"
            value={formData.homePhone}
            onChange={(e) => handleChange(e, "fatherContact", "homePhone")}
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Home Phone"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Father Home")
            )}
            isError={
              !!error.field.find((field) => field.includes("Father Home"))
            }
            disabled={isViewing}
            data-testid="father-contact-home-phone"
          />
          <FormInput
            name="fatherworkPhone"
            value={formData.workPhone}
            onChange={(e) => handleChange(e, "fatherContact", "workPhone")}
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Work Phone"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Father Work")
            )}
            isError={
              !!error.field.find((field) => field.includes("Father Work"))
            }
            disabled={isViewing}
            data-testid="father-contact-work-phone"
          />
        </div>
      </form>
    </section>
  );
};

export default memo(FatherContact);
