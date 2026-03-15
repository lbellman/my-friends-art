import Link from "@/components/atoms/link/Link";

const pages = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Our Artists",
    href: "/artists",
  },
];

const forArtists = [

  {
    label: "Artist Support",
    href: "/artist-support",
  },
];

const footerLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Our Artists",
    href: "/artists",
  },
  {
    label: "Become an Artist",
    href: "/become-an-artist",
  },
];

export default function Footer() {
  return (
    <footer className="bg-background backdrop-blur-lg border-t  py-16 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="">
            <p className="text-2xl font-display  tracking-editorial text-foreground mb-4">
              my friend&apos;s art
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Meaningful art made by someone&apos;s friend.
            </p>
          </div>

          {/* Pages */}
          <div>
            <p className="uppercase-overline mb-4">Pages</p>
            <div className="flex flex-col gap-3 items-start">
              {pages.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="uppercase-overline mb-4">For Artists</p>
            <div className="flex flex-col gap-3 items-start">
              {forArtists.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
