import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ControllerRenderProps,
  FieldValues,
  Path,
  Control,
} from "react-hook-form";
import { ICity } from "country-state-city";
import { useState, useEffect } from "react";

const CityField = <T extends FieldValues>({
  field,
  name,
  placeholder,
  cities,
  control,
  disabled,
}: {
  field: ControllerRenderProps<T, Path<T>>;
  name: Path<T>;
  placeholder?: string;
  cities: ICity[];
  control: Control<T>;
  disabled?: boolean;
}) => {
  const [value, setValue] = useState(field.value);

  useEffect(() => {
    setValue(field.value);
  }, [field.value]);

  return (
    <Select
      disabled={disabled ?? control._formValues.state.length < 1}
      value={value}
      onValueChange={(value) => {
        if (value && value.length > 1) {
          field.onChange(value);
        }
      }}
    >
      <SelectTrigger id={name} className="w-full disabled:cursor-not-allowed">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent className="lg:z-[5000]">
        <SelectItem className="hidden" value="#">
          Select Option
        </SelectItem>
        {cities.map((item) => (
          <SelectItem key={item.name} value={item.name}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CityField;
