"use client";

import ArtDetailView from "@/components/pages/ArtDetailView";
import { useParams, useSearchParams } from "next/navigation";

export default function SearchResultsArtPieceDetailPage() {
  const { artPieceId } = useParams<{ artPieceId: string }>();
  const searchQuery = useSearchParams().get("q");

  return (
    <ArtDetailView
      artPieceIdentifier={artPieceId}
      back={{
        href: `/search-results?q=${searchQuery}`,
        label: "Back to search results",
      }}
    />
  );
}
