import NextLink from "next/link";
import { cn } from "@/lib/utils";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function Link({ href, children, disabled = false, ariaLabel = "" }: LinkProps) {
  return (
    <NextLink
      href={href}
      className={cn(
        "relative inline-block tracking-wide text-sm text-foreground transition-colors duration-500",
        "after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100",
        disabled && "text-muted-foreground pointer-events-none",
      )}
      aria-label={ariaLabel}
    >
      {children}
    </NextLink>
  );
}
