import React, { useState, useEffect, FC } from "react";
import { Country, ICountry } from "country-state-city";
import FormSelect from "../input-fields/FormSelect"; // Adjust the path as needed

interface Props {
  label: string;
  onCountryChange: (value: string) => void;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  isError?: boolean;
  errorMessage?: string;
  name?: string;
  "data-testid"?: string;
}

const FormCountrySelect: FC<Props> = ({
  label,
  onCountryChange,
  defaultValue = "US",
  value,
  disabled,
  isError,
  errorMessage,
  name = "country",
  "data-testid": dataTestId,
}) => {
  const [countries, setCountries] = useState<ICountry[]>([]);

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  return (
    <FormSelect
      labelText={label}
      placeholder="Select a country"
      selectContent={countries.map((country) => ({
        label: country.name,
        value: country.isoCode,
      }))}
      onValueChange={onCountryChange}
      defaultValue={defaultValue}
      value={value}
      disabled={disabled}
      name={name}
      isError={isError}
      errorMessage={errorMessage}
      data-testid={dataTestId}
    />
  );
};

export default FormCountrySelect;
