"use client";
import useAdmin from "@/app/hooks/useAdmin";
import useAuth from "@/app/hooks/useAuth";
import DropdownMenu from "@/components/atoms/dropdown-menu/DropdownMenu";
import SearchBar from "@/components/molecules/search-bar/SearchBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Plus,
  User
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getUserDisplayName(user: SupabaseUser | null): string {
  if (!user) return "";
  const name =
    (user.user_metadata?.full_name as string) ??
    (user.user_metadata?.name as string);
  if (typeof name === "string" && name.trim()) return name.trim();
  return user.email ?? "";
}

function AdminChip() {
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-wider rounded-full bg-primary/15 text-primary px-2 py-0.5 shrink-0 border border-primary/25"
      aria-label="Administrator"
    >
      Admin
    </span>
  );
}

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Our Artists", href: "/artists" },
];

export default function Navbar() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin(user);
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
                header={
                  <span className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="truncate">{getUserDisplayName(user)}</span>
                    {!adminLoading && isAdmin ? <AdminChip /> : null}
                  </span>
                }
                items={[
                  ...(isAdmin
                    ? [
                        {
                          key: "submissions",
                          label: "Art Piece Submissions",
                          icon: <List className="size-4 text-foreground" />,
                          href: "/admin/art-piece-submissions",
                        },
                      ]
                    : []),
                  {
                    key: "dashboard",
                    label: "Artist Dashboard",
                    icon: (
                      <LayoutDashboard className="size-4 text-foreground" />
                    ),
                    href: "/dashboard",
                  },
                  {
                    key: "submit-art",
                    label: "Submit Art Pieces",
                    icon: <Plus className="size-4 text-foreground" />,
                    href: "/submit-art-piece",
                  },
                  {
                    key: "account",
                    label: "Account",
                    icon: <User className="size-4 text-foreground" />,
                    href: "/account",
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
              {loading ? null : user ? (
                <>
                  <DropdownMenuLabel className="border-t pt-2 mt-2 pb-2 font-normal">
                    <span className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="truncate text-foreground font-medium">
                        {getUserDisplayName(user)}
                      </span>
                      {!adminLoading && isAdmin ? <AdminChip /> : null}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild className="pt-2 ">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="size-4 text-foreground" />
                      <Link href="/dashboard" className=" cursor-pointer">
                        Artist Dashboard
                      </Link>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="flex items-center gap-2">
                      <Plus className="size-4 text-foreground" />
                      <Link
                        href="/submit-art-piece"
                        className=" cursor-pointer"
                      >
                        Submit Art Pieces
                      </Link>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-foreground" />
                      <Link href="/account" className=" cursor-pointer">
                        Account
                      </Link>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="flex items-center gap-2">
                      <LogOut className="size-4 text-foreground" />
                      <Link
                        href="/"
                        className=" cursor-pointer"
                        onClick={signOut}
                      >
                        Sign Out
                      </Link>
                    </div>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/artist-login">
                    <Button className="w-full">Artist Login</Button>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenuPrimitive>
        </div>
      </div>
    </nav>
  );
}
