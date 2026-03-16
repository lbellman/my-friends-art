"use client";
import SearchBar from "@/components/molecules/search-bar/SearchBar";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, Palette, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import useAuth from "@/app/hooks/useAuth";
import DropdownMenu from "@/components/atoms/dropdown-menu/DropdownMenu";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Our Artists", href: "/artists" },
];

export default function Navbar() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
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
          <SearchBar
            onSearch={(q) => {
              router.push(`/search-results?q=${encodeURIComponent(q)}`);
            }}
          />
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
            {loading ? null : user ? (
              <DropdownMenu
                items={[
                  {
                    key: "submit-art",
                    label: "Submit Art Pieces",
                    icon: <Palette className="size-4 text-foreground" />,
                    href: "/submit-art-piece",
                  },
                  {
                    key: "sign-out",
                    label: "Sign Out",
                    icon: <LogOut className="size-4 text-foreground" />,
                    onClick: signOut,
                  },
                ]}
                trigger={
                  <Button>
                    <User className="size-4 text-primary-foreground" />
                  </Button>
                }
              />
            ) : (
              <Link href="/artist-login">
                <Button>Artist Login</Button>
              </Link>
            )}
          </div>
          {/* Mobile: hamburger dropdown */}
          <DropdownMenuPrimitive>
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
              <DropdownMenuItem asChild>
                <Link href="/artist-login">
                  <Button className="w-full">Artist Login</Button>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPrimitive>
        </div>
      </div>
    </nav>
  );
}
