"use client";
import InternalLayout from "@/components/organisms/InternalLayout";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase/server";
import { ArtCard } from "@/components/molecules/art-card/ArtCard";
import { ArtPiece } from "@/@types";
import { Button } from "@/components/ui/button";
import { useState, Suspense } from "react";
import { ArtistCard } from "@/components/molecules/artist-card/ArtistCard";
import { Tables } from "@/supabase";
import { Skeleton } from "@/components/ui/skeleton";

type ResultsFilterType = "artPieces" | "artists";

function SearchResultsContent() {
  const searchQuery = useSearchParams().get("q");
  const [resultsFilter, setResultsFilter] = useState<ResultsFilterType[]>([
    "artPieces",
    "artists",
  ]);
  const [seeAllArtPieces, setSeeAllArtPieces] = useState(false);
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

  // Map RPC result (art_piece_id, etc.) to ArtCard shape (id, title, img_url, medium)
  const artPieces: ArtPiece[] = (artPieceResults ?? []).map((row) => ({
    id: row.art_piece_id,
    title: row.title,
    display_path: row.display_path,
    medium: row.medium,
    artist: {
      id: row.artist_id,
      name: row.artist_name,
    },
  })) as ArtPiece[];

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

        {!resultsFilter.includes("artPieces") ? null : isLoadingArtPieces ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-[400px]" />
            ))}
          </div>
        ) : !searchQuery ? (
          <p className="text-muted-foreground">
            Enter a search term to find art.
          </p>
        ) : artPieces.length === 0 ? (
          <p className="text-muted-foreground">
            No pieces match &quot;{searchQuery}&quot;.
          </p>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            <ul className="grid grid-cols-3 gap-4 md:gap-8 w-full">
              {(seeAllArtPieces ? artPieces : artPieces.slice(0, 6)).map(
                (piece) => (
                  <ArtCard
                    key={piece.id}
                    artPiece={piece}
                    href={`/search-results/${piece.id}?q=${searchQuery}`}
                  />
                ),
              )}
            </ul>
            {artPieces?.length && artPieces?.length > 6 && (
              <div className="mt-6">
                <Button
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setSeeAllArtPieces(!seeAllArtPieces)}
                >
                  {seeAllArtPieces
                    ? "Show Less"
                    : `Show All ${artPieces.length} Art Pieces`}
                </Button>
              </div>
            )}
          </div>
        )}

        {resultsFilter.includes("artists") && <h5 className="mt-6 font-display">Artists</h5>}

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
