import { Input as InputPrimitive } from "@/components/ui/input";

interface InputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  id?: string;
  required?: boolean;
  type?: "text" | "number";
}
export default function Input({
  value,
  onChange,
  disabled,
  placeholder,
  label,
  id,
  required,
  type = "text",
}: InputProps) {
  if (label && id) {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <InputPrimitive
          type={type}
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
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
    />
  );
}
