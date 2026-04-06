import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SingleSelectOptionType = {
  key: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
};

interface SingleSelectProps {
  value: string;
  onChange: (key: string) => void;
  options: SingleSelectOptionType[];
  disabled?: boolean;
  renderOption?: (option: SingleSelectOptionType) => React.ReactNode;
  placeholder?: string;
  label?: string;
  id?: string;
  required?: boolean;
  /** When true, shows a clear (×) control on the trigger when a value is set. */
  allowDeselect?: boolean;
}

export default function SingleSelect({
  value,
  onChange,
  options,
  disabled,
  renderOption,
  placeholder = "Select an option...",
  label,
  id,
  required,
  allowDeselect = false,
}: SingleSelectProps) {
  const showClear = allowDeselect && Boolean(value) && !disabled;

  // Radix Select stays controlled only while `value` is defined. `undefined` flips it to
  // uncontrolled and the old selection sticks. Use `""` for “no selection” (not `undefined`).
  const selectValue = value === "" ? "" : value || undefined;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="body2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex w-full min-w-0 items-stretch gap-1.5">
        <Select
          value={selectValue}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger id={id} className="min-w-0 w-full flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.key}
                value={option.key}
                disabled={option.disabled}
              >
                {renderOption ? (
                  renderOption(option)
                ) : (
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showClear && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Clear selection"
            onClick={() => onChange("")}
          >
            <XIcon className="size-4 opacity-70" />
          </Button>
        )}
      </div>
    </div>
  );
}
