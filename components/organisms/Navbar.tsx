import Image from "next/image";
import Link from "next/link";

const navLinks = [
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Our Artists",
    href: "/artists",
  },
];
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 left-0 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-8 h-navbar-height">
      <div className="flex items-center justify-between w-full flex-nowrap">
        <div className="flex items-center h-navbar-height hover:translate-y-[-2px] transition-all duration-300">
          {/* Logo */}
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
        <div className="flex items-center flex-nowrap gap-8">
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
      </div>
    </nav>
  );
}
