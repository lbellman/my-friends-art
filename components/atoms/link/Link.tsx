import NextLink from "next/link";
import { cn } from "@/lib/utils";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  blankTarget?: boolean;
  inline?: boolean;
  asChild?: boolean;
  onClick?: () => void;
}

export default function Link({
  href,
  children,
  disabled = false,
  ariaLabel = "",
  blankTarget = false,
  inline = false,
  asChild = false,
  onClick = () => {},
}: LinkProps) {
  return (
    <NextLink
      onClick={onClick}
      href={href}
      className={
        asChild
          ? undefined
          : cn(
              "relative inline-block tracking-wide text-sm transition-all duration-300 hover:translate-y-[-2px]",

              disabled && "text-muted-foreground pointer-events-none",
              inline
                ? "text-primary-foreground"
                : "text-foreground hover:text-primary-foreground ",
            )
      }
      aria-label={ariaLabel}
      target={blankTarget ? "_blank" : undefined}
      rel={blankTarget ? "noopener noreferrer" : undefined}
    >
      {children}
    </NextLink>
  );
}
