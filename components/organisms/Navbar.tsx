import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 left-0 bg-background/80 backdrop-blur-md border-b border-border px-6 h-navbar-height">
      <div className="flex items-center">
        <div className="flex items-center h-navbar-height">
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
      </div>
    </nav>
  );
}
