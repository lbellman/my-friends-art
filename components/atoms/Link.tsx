import NextLink from "next/link";
import { cn } from "@/lib/utils";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  blankTarget?: boolean;
  inline?: boolean;
}

export default function Link({
  href,
  children,
  disabled = false,
  ariaLabel = "",
  blankTarget = false,
  inline = false,
}: LinkProps) {
  return (
    <NextLink
      href={href}
      className={cn(
        "relative inline-block tracking-wide text-sm transition-colors duration-500",

        disabled && "text-muted-foreground pointer-events-none",
        inline
          ? "text-primary-foreground"
          : "text-foreground hover:text-primary ",
      )}
      aria-label={ariaLabel}
      target={blankTarget ? "_blank" : undefined}
      rel={blankTarget ? "noopener noreferrer" : undefined}
    >
      {children}
    </NextLink>
  );
}
