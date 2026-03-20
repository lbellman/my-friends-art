import { Input as InputPrimitive } from "@/components/ui/input";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  id?: string;
  required?: boolean;
}
export default function Input({
  value,
  onChange,
  disabled,
  placeholder,
  label,
  id,
  required,
}: InputProps) {
  if (label && id) {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <InputPrimitive
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
        />
      </div>
    );
  }
  return (
    <InputPrimitive
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
    />
  );
}
