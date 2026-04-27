"use client";
import { ArtPiece } from "@/@types";
import useRestoreArtList from "@/app/hooks/useRestoreArtList";
import { ArtCard } from "@/components/molecules/art-card/ArtCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  mapRowsToArtPieces,
  pickFeaturedByArtist,
} from "@/lib/art-piece-sections";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useRef } from "react";

const HOME_CAROUSEL_SIZE = 6;

function HomeCarousel({
  title,
  href,
  items,
  isLoading,
}: {
  title: string;
  href: string;
  items: ArtPiece[];
  isLoading: boolean;
}) {
  const listRef = useRef<HTMLUListElement | null>(null);

  const scrollByDirection = (direction: "left" | "right") => {
    if (!listRef.current) return;
    const amount = Math.max(220, Math.floor(listRef.current.clientWidth * 0.8));
    listRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative pt-12">
      <div className="absolute left-0 top-0 w-full z-1 inline-flex  justify-between items-center gap-3 rounded-t-xl border border-border/70 border-b-0 bg-secondary/80  px-6 py-3 md:py-5  md:px-7">
        <h4 className="font-display tracking-wide text-foreground whitespace-nowrap">
          {title}
        </h4>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`Scroll ${title} left`}
            onClick={() => scrollByDirection("left")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`Scroll ${title} right`}
            onClick={() => scrollByDirection("right")}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button asChild type="button" variant="secondary" size="sm">
            <Link href={href}>See all</Link>
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-6 md:px-5 md:py-8">
        {isLoading ? (
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-2">
            {Array.from({ length: HOME_CAROUSEL_SIZE }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="w-[200px] md:w-[240px] aspect-3/4 rounded-xl shrink-0"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No art pieces yet.</p>
        ) : (
          <ul
            ref={listRef}
            className="list-none py-4 m-0 flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-2"
          >
            {items.map((piece) => (
              <li key={piece.id} className="w-[200px] md:w-[240px] shrink-0 snap-start">
                <ArtCard
                  artPiece={piece}
                  href={`/${piece.id}`}
                  listRestore={{ namespace: "home", page: 1 }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function HomeContent() {
  const { data, isLoading: isLoadingSections } = useQuery({
    queryKey: ["home-carousel-sections"],
    queryFn: async () => {
      const baseSelect =
        "id, title, thumbnail_path, status, display_path, category, created_at, artist_id, artist:artist_id(id, name)";

      const [{ data: featuredRows, error: featuredError }, { data: wallArtRows, error: wallArtError }, { data: allRows, error: allError }] = await Promise.all([
        supabase
          .from("art_piece")
          .select(baseSelect)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(60),
        supabase
          .from("art_piece")
          .select(baseSelect)
          .eq("status", "approved")
          .eq("category", "wall-art")
          .order("created_at", { ascending: false })
          .limit(HOME_CAROUSEL_SIZE),
        supabase
          .from("art_piece")
          .select(baseSelect)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(HOME_CAROUSEL_SIZE),
      ]);

      if (featuredError) throw new Error(featuredError.message);
      if (wallArtError) throw new Error(wallArtError.message);
      if (allError) throw new Error(allError.message);

      const featuredPool = mapRowsToArtPieces(featuredRows ?? []);
      const featured = pickFeaturedByArtist(featuredPool, HOME_CAROUSEL_SIZE);
      const wallArt = mapRowsToArtPieces(wallArtRows ?? []);
      const allArt = mapRowsToArtPieces(allRows ?? []);

      return { featured, wallArt, allArt };
    },
  });

  useRestoreArtList({
    isLoading: isLoadingSections,
    namespace: "home",
  });

  const featured = data?.featured ?? [];
  const wallArt = data?.wallArt ?? [];
  const allArt = data?.allArt ?? [];

  return (
    <div className="relative flex flex-col">
      <div className="relative min-h-[60vh] flex items-center justify-center w-full overflow-hidden">
        <Image
          src="/art-pieces/seaside-meadow.webp"
          alt="Windy cliffside"
          fill
          className="object-cover opacity-0 animate-fade-in object-[50%_50%]"
          priority
          sizes="100vw"
          loading="eager"
        />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="flex flex-col items-center gap-4 absolute">
          <h1
            className=" opacity-0 animate-fade-up text-white text-center tracking-wide"
            style={{ animationDelay: "200ms" }}
          >
            my friend&apos;s art
          </h1>
          <h6
            className=" opacity-0 animate-fade-up font-display text-center text-white tracking-wide"
            style={{ animationDelay: "400ms" }}
          >
            made by someone&apos;s friend.
          </h6>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl flex flex-col gap-12 px-4 py-12">
        <HomeCarousel
          title="featured"
          href="/art/featured"
          items={featured}
          isLoading={isLoadingSections}
        />
        <HomeCarousel
          title="wall art"
          href="/art/wall-art"
          items={wallArt}
          isLoading={isLoadingSections}
        />
        <HomeCarousel
          title="all pieces"
          href="/art/all"
          items={allArt}
          isLoading={isLoadingSections}
        />
      </div>
    </div>
  );
}

function HomeFallback() {
  return (
    <div className="relative flex flex-col">
      <div className="relative min-h-[60vh] flex items-center justify-center w-full overflow-hidden">
        <Image
          src="/art-pieces/seaside-meadow.webp"
          alt="Windy cliffside"
          fill
          className="object-cover object-[50%_50%]"
          priority
          sizes="100vw"
          loading="eager"
        />
        <div className="absolute inset-0 bg-primary/75" />
      </div>
      <div className="mx-auto w-full max-w-6xl flex flex-col gap-12 px-4 py-12">
        {["featured", "wall art", "all art"].map((section) => (
          <section key={section} className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-2">
              {Array.from({ length: HOME_CAROUSEL_SIZE }).map((_, i) => (
                <Skeleton
                  key={`${section}-${i}`}
                  className="w-[200px] md:w-[240px] aspect-3/4 rounded-xl shrink-0"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
