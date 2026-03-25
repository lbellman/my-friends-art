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
}: SingleSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="body2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full min-w-0">
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
    </div>
  );
}
