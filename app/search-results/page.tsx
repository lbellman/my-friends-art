"use client";
import { ArtPiece } from "@/@types";
import InternalLayout from "@/components/organisms/InternalLayout";
import {
  ART_PIECES_PAGE_SIZE,
  PaginatedArtPieces,
} from "@/components/organisms/paginated-art-pieces/PaginatedArtPieces";
import { ArtistCard } from "@/components/molecules/artist-card/ArtistCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import { Tables } from "@/supabase";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import useRestoreArtList from "@/app/hooks/useRestoreArtList";

type ResultsFilterType = "artPieces" | "artists";

function SearchResultsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q");
  const rawPage = searchParams.get("page");
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);

  const [resultsFilter, setResultsFilter] = useState<ResultsFilterType[]>([
    "artPieces",
    "artists",
  ]);
  const [seeAllArtists, setSeeAllArtists] = useState(false);

  const { data: artPieceResults, isLoading: isLoadingArtPieces } = useQuery({
    queryKey: ["artPieces", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const { data, error } = await supabase.rpc("rpc_search_art_pieces", {
        query: searchQuery,
      });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const { data: artistResults, isLoading: isLoadingArtists } = useQuery({
    queryKey: ["artists", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const { data, error } = await supabase.rpc("rpc_search_artists", {
        query: searchQuery,
      });
      if (error) throw new Error(error.message);
      return data as Tables<"artist">[];
    },
  });

  useRestoreArtList({
    isLoading: isLoadingArtPieces || isLoadingArtists,
    namespace: "search-results",
  });

  const artPieces: ArtPiece[] = (artPieceResults ?? []).map((row) => ({
    id: row.art_piece_id,
    title: row.title,
    thumbnail_path: row.thumbnail_path,
    medium: row.medium,
    artist: {
      id: row.artist_id,
      name: row.artist_name,
    },
  })) as ArtPiece[];

  const totalArtCount = artPieces.length;
  const totalArtPages =
    totalArtCount > 0
      ? Math.max(1, Math.ceil(totalArtCount / ART_PIECES_PAGE_SIZE))
      : 0;

  const from = (page - 1) * ART_PIECES_PAGE_SIZE;
  const pagedArtPieces = artPieces.slice(from, from + ART_PIECES_PAGE_SIZE);

  useEffect(() => {
    if (totalArtCount === 0 || totalArtPages === 0) return;
    if (page > totalArtPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(totalArtPages));
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [totalArtCount, totalArtPages, page, router, pathname, searchParams]);

  const qParam = searchQuery ? encodeURIComponent(searchQuery) : "";

  return (
    <InternalLayout title="search results">
      <div className="flex flex-col gap-4">
        <h6>Showing results for &quot;{searchQuery}&quot;</h6>
        <div className="flex items-center flex-nowrap gap-2">
          <Button
            variant={
              resultsFilter.includes("artPieces") ? "default" : "outline"
            }
            className="rounded-full"
            onClick={() =>
              setResultsFilter(
                resultsFilter.includes("artPieces")
                  ? resultsFilter.filter((type) => type !== "artPieces")
                  : [...resultsFilter, "artPieces"],
              )
            }
          >
            Art Pieces {artPieces.length ? `(${artPieces.length})` : ""}
          </Button>
          <Button
            variant={resultsFilter.includes("artists") ? "default" : "outline"}
            className="rounded-full"
            onClick={() =>
              setResultsFilter(
                resultsFilter.includes("artists")
                  ? resultsFilter.filter((type) => type !== "artists")
                  : [...resultsFilter, "artists"],
              )
            }
          >
            Artists {artistResults?.length ? `(${artistResults?.length})` : ""}
          </Button>
        </div>

        {resultsFilter.includes("artPieces") && (
          <h5 className="mt-6 font-display">Art Pieces</h5>
        )}

        {!resultsFilter.includes("artPieces") ? null : !searchQuery ? (
          <p className="text-muted-foreground">
            Enter a search term to find art.
          </p>
        ) : (
          <PaginatedArtPieces
            namespace="search-results"
            items={pagedArtPieces}
            totalCount={totalArtCount}
            page={page}
            pageSize={ART_PIECES_PAGE_SIZE}
            isLoading={isLoadingArtPieces}
            emptyContent={
              <p className="text-muted-foreground">
                No pieces match &quot;{searchQuery}&quot;.
              </p>
            }
            hrefForPiece={(piece) => `/search-results/${piece.id}?q=${qParam}`}
            onPageChange={(next) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", String(next));
              router.push(`${pathname}?${params.toString()}`);
            }}
            gridClassName="grid-cols-4 md:grid-cols-4 gap-4 md:gap-6 w-full"
          />
        )}

        {resultsFilter.includes("artists") && (
          <h5 className="mt-6 font-display">Artists</h5>
        )}

        {!resultsFilter.includes("artists") ? null : isLoadingArtists ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="w-full h-[300px]" />
          </div>
        ) : !searchQuery ? (
          <p className="text-muted-foreground">
            Enter a search term to find artists.
          </p>
        ) : artistResults?.length === 0 ? (
          <p className="text-muted-foreground">
            No artists match &quot;{searchQuery}&quot;.
          </p>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            <ul className="w-full">
              {(seeAllArtists
                ? (artistResults ?? [])
                : (artistResults?.slice(0, 6) ?? [])
              ).map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  linkHref={`/artists/${artist.id}`}
                  linkText="Go to Artist"
                />
              ))}
            </ul>
            {artistResults?.length && artistResults?.length > 6 && (
              <div className="mt-6">
                <Button
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setSeeAllArtists(!seeAllArtists)}
                >
                  {seeAllArtists
                    ? "Show Less"
                    : `Show All ${artistResults?.length ?? 0} Artists`}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </InternalLayout>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <InternalLayout title="Search Results">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </InternalLayout>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
