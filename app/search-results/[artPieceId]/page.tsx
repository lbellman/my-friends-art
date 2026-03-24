"use client";

import ArtDetailView from "@/components/views/ArtDetailView";
import { useParams, useSearchParams } from "next/navigation";

export default function SearchResultsArtPieceDetailPage() {
  const { artPieceId } = useParams<{ artPieceId: string }>();
  const searchQuery = useSearchParams().get("q");

  return (
    <ArtDetailView
      artPieceIdentifier={artPieceId}
      back={{
        href: searchQuery
          ? `/search-results?q=${encodeURIComponent(searchQuery)}`
          : "/search-results",
        label: "Back to search results",
      }}
    />
  );
}
