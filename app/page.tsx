"use client";
import { ArtPiece } from "@/@types";
import useRestoreArtList from "@/app/hooks/useRestoreArtList";
import { ArtCard } from "@/components/molecules/art-card/ArtCard";
import {
  ART_PIECES_PAGE_SIZE,
  PaginatedArtPieces,
} from "@/components/organisms/paginated-art-pieces/PaginatedArtPieces";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPage = searchParams.get("page");
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);

  const { data, isLoading: isLoadingArtPieces } = useQuery({
    queryKey: ["artPieces", page],
    queryFn: async () => {
      const from = (page - 1) * ART_PIECES_PAGE_SIZE;
      const to = from + ART_PIECES_PAGE_SIZE - 1;
      const {
        data: rows,
        error,
        count,
      } = await supabase
        .from("art_piece")
        .select(
          "id, title, thumbnail_path, status, display_path, category, created_at, artist:artist_id(id, name)",
          { count: "exact" },
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) {
        throw new Error(error.message);
      }
      const items = (rows ?? []).map((piece) => ({
        ...piece,
        artist: piece.artist,
      })) as ArtPiece[];
      return { items, count: count ?? 0 };
    },
  });

  useRestoreArtList({
    isLoading: isLoadingArtPieces,
    namespace: "home",
  });

  const totalCount = data?.count ?? 0;
  const artPieces = data?.items ?? [];
  const totalPages =
    totalCount > 0
      ? Math.max(1, Math.ceil(totalCount / ART_PIECES_PAGE_SIZE))
      : 0;

  useEffect(() => {
    if (totalCount === 0 || totalPages === 0) return;
    if (page > totalPages) {
      router.replace(`${pathname}?page=${totalPages}`);
    }
  }, [totalCount, totalPages, page, router, pathname]);

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
      <div className="mx-auto w-full max-w-6xl flex flex-col gap-12 px-4 py-12">
        <h4 className="font-display tracking-wide text-foreground">
          all pieces
        </h4>
        <PaginatedArtPieces
          items={artPieces}
          totalCount={totalCount}
          page={page}
          pageSize={ART_PIECES_PAGE_SIZE}
          isLoading={isLoadingArtPieces}
          emptyContent={
            <p className="text-muted-foreground">No art pieces yet.</p>
          }
          onPageChange={(next) => {
            router.push(`${pathname}?page=${next}`);
          }}
          renderArtPiece={(piece) => (
            <ArtCard
              artPiece={piece}
              href={`/${piece.id}`}
              listRestore={{ namespace: "home", page }}
            />
          )}
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
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-8">
          {Array.from({ length: ART_PIECES_PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-3/4 rounded-xl" />
          ))}
        </div>
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
