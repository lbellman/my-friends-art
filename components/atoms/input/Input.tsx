import { Input as InputPrimitive } from "@/components/ui/input";

interface InputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  id?: string;
  required?: boolean;
  type?: "text" | "number" | "email";
  /** When set, enforces a max character length (text-like inputs). */
  maxLength?: number;
  /** When `maxLength` is set, show `current / max` (default: true). */
  showCharCount?: boolean;
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
  maxLength,
  showCharCount = true,
}: InputProps) {
  const showCount = maxLength != null && showCharCount && type === "text";

  const charCountEl = showCount ? (
    <p className="text-xs text-muted-foreground text-right tabular-nums">
      {String(value).length} / {maxLength}
    </p>
  ) : null;

  const inputEl = (
    <InputPrimitive
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
      maxLength={type === "text" ? maxLength : undefined}
    />
  );

  if (label && id) {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="body2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {inputEl}
        {charCountEl}
      </div>
    );
  }

  if (showCount) {
    return (
      <div className="flex flex-col gap-1">
        {inputEl}
        {charCountEl}
      </div>
    );
  }

  return inputEl;
}
