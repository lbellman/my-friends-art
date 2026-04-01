import Button from "@/components/atoms/button/Button";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";

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
  /** User label area at top of menu (string or custom node, e.g. name + badge) */
  header?: React.ReactNode;
}

export default function DropdownMenu({
  items,
  trigger,
  header,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenuPrimitive open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {header && (
          <DropdownMenuLabel className="border-b border-border pb-2">
            {header}
          </DropdownMenuLabel>
        )}
        {items.map((item) => (
          item.href ? (
            <DropdownMenuItem key={item.key} disabled={item.disabled} asChild>
              <Link
                href={item.href}
                className="w-full"
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
              >
                {item.icon && <>{item.icon}</>}
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              key={item.key}
              disabled={item.disabled}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
            >
              {item.icon && <>{item.icon}</>}
              <span>{item.label}</span>
            </DropdownMenuItem>
          )
        ))}
      </DropdownMenuContent>
    </DropdownMenuPrimitive>
  );
}
