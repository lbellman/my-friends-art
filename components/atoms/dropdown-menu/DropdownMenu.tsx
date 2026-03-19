import Button from "@/components/atoms/button/Button";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export type MenuItem = {
  key: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
};

interface DropdownMenuProps {
  items: MenuItem[];
  trigger: React.ReactNode;
  header?: string;
}

export default function DropdownMenu({
  items,
  trigger,
  header,
}: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {header && (
          <DropdownMenuLabel className="border-b border-border pb-2">
            {header}
          </DropdownMenuLabel>
        )}
        {items.map((item) => (
          <DropdownMenuItem
            key={item.key}
            disabled={item.disabled}
            onClick={item.onClick}
          >
            {item.icon && <>{item.icon}</>}
            {item.href ? (
              <Link href={item.href} className="w-full">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenuPrimitive>
  );
}
