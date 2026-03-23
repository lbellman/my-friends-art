import { Textarea as TextareaPrimitive } from "@/components/ui/textarea";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  id?: string;
  required?: boolean;
}
export default function TextArea({
  value,
  onChange,
  disabled,
  placeholder,
  label,
  id,
  required,
}: TextAreaProps) {

  const className ="min-w-[300px]"
  if (label && id) {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <TextareaPrimitive
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={className}
        />
      </div>
    );
  }
  return (
    <TextareaPrimitive
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
      className={className}
    />
  );
}
