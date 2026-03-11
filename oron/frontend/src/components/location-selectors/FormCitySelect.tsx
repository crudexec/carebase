import React, { useState, useEffect, FC } from "react";
import { City, ICity } from "country-state-city";
import FormSelect from "../input-fields/FormSelect"; // Adjust the path as needed

interface Props {
  label: string;
  countryCode: string;
  stateCode: string;
  onCityChange: (value: string) => void;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  isError?: boolean;
  errorMessage?: string;
  name?: string;
  "data-testid"?: string;
}

const FormCitySelect: FC<Props> = ({
  label,
  countryCode,
  stateCode,
  onCityChange,
  defaultValue,
  value,
  disabled,
  isError,
  errorMessage,
  name = "cityOrTown",
  "data-testid": dataTestId,
}) => {
  const [cities, setCities] = useState<ICity[]>([]);
  const [selectValue, setSelectValue] = useState(value);

  useEffect(() => {
    if (countryCode && stateCode) {
      setCities(City.getCitiesOfState(countryCode, stateCode));
    } else {
      setCities([]);
    }
  }, [countryCode, stateCode, value]);

  useEffect(() => {
    if (defaultValue && stateCode && !selectValue) {
      onCityChange(defaultValue);
      setSelectValue(defaultValue);
    }
  }, [stateCode, defaultValue]);

  useEffect(() => {
    if (value) {
      setSelectValue(value);
    }
  }, [value]);

  return (
    <FormSelect
      labelText={label}
      placeholder="Select a city"
      selectContent={cities.map((city) => ({
        label: city.name,
        value: city.name,
      }))}
      onValueChange={(val) => {
        setSelectValue(val);
        onCityChange(val);
      }}
      defaultValue={defaultValue}
      value={selectValue}
      disabled={disabled || !countryCode || !stateCode}
      name={name}
      isError={isError}
      errorMessage={errorMessage}
      data-testid={dataTestId}
    />
  );
};

export default FormCitySelect;
