import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { State, IState } from "country-state-city";

const StateField = <T extends FieldValues>({
  field,
  name,
  placeholder,
  disabled,
}: {
  field: ControllerRenderProps<T, Path<T>>;
  name: Path<T>;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const states: IState[] = State.getStatesOfCountry("US");

  return (
    <Select
      disabled={disabled}
      value={field.value}
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
        {states.map((item) => (
          <SelectItem key={item.isoCode} value={item.isoCode}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StateField;
