import { Button as ShadButton } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type ButtonVariantType = "primary" | "secondary" | "destructive" | "success";

interface ButtonProps {
  variant?: ButtonVariantType;
  size?: "xs" | "sm" | "default" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  label?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  id?: string;
  dataTestId?: string;
}

export default function Button({
  variant = "primary",
  size = "default",
  disabled = false,
  onClick,
  type = "button",
  label,
  icon,
  loading = false,
  className,
  id,
  dataTestId,
}: ButtonProps) {
  const isIconVariant = icon && !label;
  return (
    <ShadButton
      type={type}
      id={id}
      data-testid={dataTestId}
      variant={
        variant === "primary"
          ? "default"
          : variant === "secondary"
            ? "outline"
            : variant === "destructive"
              ? "destructive"
              : variant === "success"
                ? "success"
              : "default"
      }
      size={isIconVariant ? "icon" : size}
      disabled={disabled}
      onClick={onClick ?? undefined}
      className={className}
    >
      <div className="flex items-center flex-nowrap gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {label}
      </div>
    </ShadButton>
  );
}
