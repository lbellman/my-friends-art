import { Textarea as TextareaPrimitive } from "@/components/ui/textarea";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  id?: string;
  required?: boolean;
  /** When set, enforces a max character length. */
  maxLength?: number;
  /** When `maxLength` is set, show `current / max` (default: true). */
  showCharCount?: boolean;
}
export default function TextArea({
  value,
  onChange,
  disabled,
  placeholder,
  label,
  id,
  required,
  maxLength,
  showCharCount = true,
}: TextAreaProps) {
  const className = "min-w-[300px]";
  const showCount = maxLength != null && showCharCount;

  const charCountEl = showCount ? (
    <p className="text-xs text-muted-foreground text-right tabular-nums">
      {value.length} / {maxLength}
    </p>
  ) : null;

  const textareaEl = (
    <TextareaPrimitive
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      className={className}
    />
  );

  if (label && id) {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="body2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {textareaEl}
        {charCountEl}
      </div>
    );
  }

  if (showCount) {
    return (
      <div className="flex flex-col gap-1">
        {textareaEl}
        {charCountEl}
      </div>
    );
  }

  return textareaEl;
}
