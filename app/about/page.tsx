"use client";
import NextLink from "next/link";
import Link from "@/components/atoms/link/Link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

function Stage({
  title,
  description,
  current,
  stageNumber,
  animationDelay,
}: {
  title: string;
  description: React.ReactNode;
  current: boolean;
  stageNumber: number;
  animationDelay: string;
}) {
  return (
    <section
      className={`w-full rounded-2xl border px-8 py-10 md:px-12 md:py-14 flex flex-col gap-8 transition-colors backdrop-blur-xl opacity-0 animate-fade-up ${
        current
          ? "border-white/50 bg-white/10 shadow-lg shadow-black/20"
          : "border-white/30 bg-white/16 shadow-md shadow-black/5"
      } `}
      style={{ animationDelay: animationDelay }}
    >
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border  bg-white/10 backdrop-blur-sm font-display text-2xl font-medium  border-white/30 text-white `}
        >
          {stageNumber}
        </span>
        <div className="flex justify-between items-center gap-6 min-w-0">
          <h5 className={`font-display text-white`}>{title}</h5>
          {current && (
            <span className="inline-flex w-fit items-center rounded-full border border-white/40 bg-white/15 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary-foreground">
              Current Stage
            </span>
          )}
        </div>
      </div>
      <div className="text-base md:text-lg text-white font-medium leading-relaxed max-w-3xl">
        {description}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Fixed full-viewport image layer */}
      <div className="fixed inset-0 h-screen w-full z-0">
        <Image
          src="/art-pieces/seaside-meadow.webp"
          alt=""
          fill
          className="object-cover object-[50%_35%]"
          priority
          sizes="100vw"
          aria-hidden
        />
        <div className="absolute inset-0 bg-primary/80" />
      </div>
      {/* Content scrolls over the image */}
      <div className="relative z-8 min-h-screen py-12 flex flex-col items-center gap-10 ">
        <div className="max-w-4xl w-full px-4 flex flex-col items-center gap-10 ">
          <h1
            className="font-display text-white opacity-0 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            about
          </h1>
          <h6
            className="text-white font-medium text-center max-w-2xl leading-relaxed opacity-0 animate-fade-up"
            style={{ animationDelay: "400ms" }}
          >
            My Friend&apos;s Art is a platform for celebrating and encouraging
            art of all kinds. It is a passion project currently being built by
            Lindsey Bellman, a software engineer, artist, and friend of many
            artists.
          </h6>

          <h6
            className="text-white font-medium text-center max-w-2xl leading-relaxed opacity-0 animate-fade-up"
            style={{ animationDelay: "600ms" }}
          >
            This platform will be built in several stages.
          </h6>

          <div className="flex flex-col gap-8 md:gap-10">
            <Stage
              stageNumber={1}
              title="Simple Gallery"
              animationDelay="800ms"
              description={
                <>
                  A simple art gallery showcasing artists and their art.
                  Visitors can search by medium, artist, or title. Prints can be
                  requested for individual pieces, and the artist will be
                  notified via email. Pricing and shipping details are handled
                  by the artist. To become an artist,{" "}
                  <NextLink
                    href="/become-an-artist"
                    className="text-primary-foreground hover:text-primary-foreground/80"
                  >
                    fill out the application form.
                  </NextLink>
                </>
              }
              current={false}
            />
            <Stage
              stageNumber={2}
              title="artist dashboard & analytics"
              animationDelay="1000ms"
              description={
                <>
                  Artists on the platform will have a dashboard where they can
                  sign in and manage their profiles, artist bio, and art pieces.
                  Simple analytics will be available to allow artists to track
                  how many print requests they have received on their work.
                </>
              }
              current={true}
            />
            <Stage
              stageNumber={3}
              title="payments"
              animationDelay="1200ms"
              description={
                <>
                  A payment integration will be added so that customers can
                  purchase prints directly from the platform. Artists will be
                  responsible for printing, shipping, and setting their own
                  pricing. Sliding scale pricing will be available if the artist
                  chooses. There will also be a custom amount option for
                  customers to make their own offers (to a minumum).
                </>
              }
              current={false}
            />
            <Stage
              stageNumber={4}
              title="community curation"
              animationDelay="1600ms"
              description={
                <>
                  The fun part! Artists will be able to connect with other
                  artists on the platform, follow each other, receive
                  notifications when new work is posted, and more. Events will
                  be posted on the platform for local artists to meet each
                  other. Occasional in-person markets will be organized and
                  presented by the platform.
                </>
              }
              current={false}
            />
          </div>
          <h4 className="my-12 text-white font-display font-medium text-center">
            Thank you for being here and supporting independent art!{" "}
          </h4>
          <div className="flex flex-row gap-6 px-6">
            <Button variant="outline" size="lg" className="shadow-lg">
              <Link
                href="https://software.lindseybellman.com"
                asChild
                blankTarget
              >
                <div className="flex flex-row gap-2 items-center">
                  Lindsey&apos;s Software Portfolio
                  <ExternalLink />
                </div>
              </Link>
            </Button>
            <Button className="shadow-lg" size="lg">
              <Link href="/" asChild>
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
