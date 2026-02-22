import Link from "@/components/atoms/Link";

export default function Footer() {
  return (
    <footer className="bg-secondary/20 backdrop-blur-lg border-t border-secondary py-12 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand */}
          <div>
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
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/" disabled>
                Our Artists
              </Link>
              <Link href="/" disabled>
                Become an Artist
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="uppercase-overline mb-4">Contact</p>
            <div className="flex flex-col gap-3 items-start">
              <Link
                href="mailto:bellmanlindsey@gmail.com"
                ariaLabel="Email (opens mail app)"
              >
                bellmanlindsey@gmail.com
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
