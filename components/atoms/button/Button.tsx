import { Button as ShadButton } from "@/components/ui/button";

type ButtonVariantType = "primary" | "secondary" | "destructive";

interface ButtonProps {
  variant?: ButtonVariantType;
  size?: "xs" | "sm" | "default" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  label?: string;
  icon?: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "default",
  disabled = false,
  onClick,
  type = "button",
  label,
  icon,
}: ButtonProps) {
  const isIconVariant = icon && !label;
  return (
    <ShadButton
      type={type}
      variant={
        variant === "primary"
          ? "default"
          : variant === "secondary"
            ? "outline"
            : variant === "destructive"
              ? "destructive"
              : "default"
      }
      size={isIconVariant ? "icon" : size}
      disabled={disabled}
      onClick={onClick ?? undefined}
    >
      <div className="flex items-center flex-nowrap gap-2">
        {icon}
        {label}
      </div>
    </ShadButton>
  );
}
