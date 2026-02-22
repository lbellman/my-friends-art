import Link from "@/components/atoms/link/Link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
            className="p-8 animate-fade-up opacity-0 "
            style={{ animationDelay: "700ms" }}
          >
            <CardHeader>
              <CardTitle className="text-center text-3xl">
                Stay Tuned!
              </CardTitle>
              <CardDescription className="text-center text-base">
                I am actively working on this project and will be pushing
                updates regularly.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 border-t">
              <p className="text-center text-sm tracking-wide ">
                Refer to the{" "}
                <Link
                  href="https://github.com/lbellman/my-friends-art"
                  blankTarget
                  inline
                >
                  Github Repository
                </Link>{" "}
                for detailed issue tickets and dev updates 💻
              </p>
              <p className="text-center text-sm tracking-wide ">
                Refer to the{" "}
                <Link
                  href="https://www.figma.com/design/wRrelj2lS04Bm5VrOwfsm7/My-Friend-s-Art?node-id=23-691&t=MZ64ZTwSrVYanSp8-1"
                  blankTarget
                  inline
                >
                  Figma Board
                </Link>{" "}
                to explore the brand identity and planned designs 🎨
              </p>
            </CardContent>
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
