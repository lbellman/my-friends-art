import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OptionType = {
  key: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
};

interface SingleSelectProps {
  value: string;
  onChange: (key: string) => void;
  options: OptionType[];
  disabled?: boolean;
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
  placeholder = "Select an option...",
  label,
  id,
  required,
}: SingleSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.key}
              value={option.key}
              disabled={option.disabled}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
