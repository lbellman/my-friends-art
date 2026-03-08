"use client";
import SearchBar from "@/components/molecules/SearchBar";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Our Artists", href: "/artists" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 left-0 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-8 h-navbar-height">
      <div className="flex items-center justify-between w-full flex-nowrap">
        <div className="flex items-center h-navbar-height hover:translate-y-[-2px] transition-all duration-300">
          <Link href="/">
            <Image
              loading="eager"
              src="/logo.webp"
              alt="My Friend's Art"
              width={150}
              height={20}
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center flex-nowrap gap-3 md:gap-8">
          <SearchBar />
          {/* Desktop: nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="uppercase tracking-wider font-display text-base hover:text-primary-foreground transition-all duration-300 hover:translate-y-[-2px]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          {/* Mobile: hamburger dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40 md:hidden">
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    className="uppercase tracking-wider font-display cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
