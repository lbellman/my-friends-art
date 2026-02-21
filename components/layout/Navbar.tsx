import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6">
      <div className="flex items-center">
        <div className="flex items-center h-20">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/logo.webp"
              alt="My Friend's Art"
              width={150}
              height={40}
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
