import React, { useState, useEffect, FC } from "react";
import { State, IState } from "country-state-city";
import FormSelect from "../input-fields/FormSelect"; // Adjust the path as needed

interface Props {
  label: string;
  countryCode: string;
  onStateChange: (value: string) => void;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  isError?: boolean;
  errorMessage?: string;
  name?: string;
  "data-testid"?: string;
}

const FormStateSelect: FC<Props> = ({
  label,
  countryCode,
  onStateChange,
  defaultValue,
  value,
  disabled,
  isError,
  errorMessage,
  name = "state",
  "data-testid": dataTestId,
}) => {
  const [states, setStates] = useState<IState[]>([]);

  const [selectValue, setSelectValue] = useState(value);
  useEffect(() => {
    if (countryCode) {
      setStates(State.getStatesOfCountry(countryCode));
    } else {
      setStates([]);
    }
  }, [countryCode, value]);

  useEffect(() => {
    if (defaultValue) {
      onStateChange(defaultValue);
      setSelectValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    if (value) {
      setSelectValue(value);
    }
  }, [value]);

  return (
    <FormSelect
      labelText={label}
      placeholder="Select a state"
      selectContent={states.map((state) => ({
        label: state.name,
        value: state.isoCode,
      }))}
      onValueChange={(val) => {
        setSelectValue(val);
        onStateChange(val);
      }}
      defaultValue={defaultValue}
      value={selectValue}
      disabled={disabled || !countryCode}
      name={name}
      isError={isError}
      errorMessage={errorMessage}
      data-testid={dataTestId}
    />
  );
};

export default FormStateSelect;
