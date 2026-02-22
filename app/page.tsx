import Button from "@/components/atoms/button/Button";
import Link from "@/components/atoms/link/Link";

import Card from "@/components/molecules/card/Card";
import Image from "next/image";

// Paste your Figma embed URL here (Share → Embed in Figma)
const FIGMA_PROTOTYPE_URL =
  "https://www.figma.com/proto/wRrelj2lS04Bm5VrOwfsm7/My-Friend-s-Art?node-id=1-3&t=u70NkSjjtAkur4yS-1";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero — full viewport, fixed so content scrolls over it */}
      <section className="fixed inset-0 z-0 flex min-h-screen flex-col animate-fade-in items-center justify-center px-6 py-20">
        <Image
          src="/art-pieces/seaside-meadow.webp"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-primary/75" aria-hidden />
      </section>

      {/* Coming Soon & Logo */}
      <div className="relative z-10 py-20 pt-32 flex flex-col items-center text-center">
        <Image
          src="/logo-small.webp"
          alt="My Friend's Art"
          width={150}
          height={40}
          className="h-20 animate-fade-up opacity-0 w-auto object-contain md:h-22 drop-shadow-sm"
          style={{ animationDelay: "300ms" }}
        />
        <div className="flex flex-col items-center gap-3">
          <h1
            className="font-display opacity-0 animate-fade-up text-4xl tracking-wide text-white sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animationDelay: "500ms" }}
          >
            coming soon
          </h1>
        </div>
      </div>

      {/* Spacer so content starts below the fold */}

      {/* Stay tuned — in a card, scrolls over hero */}
      <section className="relative z-10 pt-10 px-4 pb-12 md:px-6">
        <div className="mx-auto max-w-2xl">
          <Card
            title="Stay Tuned!"
            description="I am actively working on this project and will be pushing updates regularly."
          >
            <div className="w-full flex flex-col ">
              {/* GitHub */}
              <div className="flex flex-col gap-2 border-b border-border pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <Image
                    src="/github-logo.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 shrink-0 object-contain"
                    aria-hidden
                  />
                  <p className="font-semibold text-center">GitHub</p>
                </div>
                <p className="text-sm tracking-wide text-muted-foreground">
                  Refer to the{" "}
                  <Link
                    href="https://github.com/lbellman/my-friends-art"
                    blankTarget
                    inline
                  >
                    Github repository
                  </Link>{" "}
                  for issue tickets and dev updates.
                </p>
              </div>

              {/* Figma */}
              <div className="flex flex-col gap-2 border-b pt-4 border-border pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <Image
                    src="/figma-logo.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 shrink-0 object-contain"
                    aria-hidden
                  />
                  <p className="font-semibold">Figma</p>
                </div>
                <p className="text-sm tracking-wide text-muted-foreground">
                  Explore the{" "}
                  <Link
                    href="https://www.figma.com/design/wRrelj2lS04Bm5VrOwfsm7/My-Friend-s-Art?node-id=23-691&t=MZ64ZTwSrVYanSp8-1"
                    blankTarget
                    inline
                  >
                    Figma board
                  </Link>{" "}
                  for brand identity and planned designs.
                </p>
              </div>

              {/* Storybook */}
              <div className="flex flex-col gap-2 pt-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/storybook-logo.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 shrink-0 object-contain"
                    aria-hidden
                  />
                  <p className="font-semibold">Storybook</p>
                </div>
                <p className="text-sm tracking-wide text-muted-foreground">
                  Check out the{" "}
                  <Link
                    href="https://my-friends-art-git-7-storybook-e11211-lindsey-bellmans-projects.vercel.app"
                    blankTarget
                    inline
                  >
                    Storybook project
                  </Link>{" "}
                  to explore the component library and design system.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Figma prototype */}
      <section className="relative z-10 px-4 py-16 md:px-6">
        <div
          className="mx-auto max-w-5xl animate-fade-up opacity-0"
          style={{ animationDelay: "900ms" }}
        >
          <h2 className="mb-6 font-display text-center text-white ">
            figma prototype
          </h2>
          {FIGMA_PROTOTYPE_URL ? (
            <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/30 shadow-sm">
              <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/30">
                <div className="aspect-video w-full">
                  <iframe
                    title="My Friend's Art — Figma prototype"
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(FIGMA_PROTOTYPE_URL)}`}
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
              <p className="text-sm">
                Add your Figma embed URL in{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  app/page.tsx
                </code>{" "}
                (FIGMA_EMBED_URL)
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
