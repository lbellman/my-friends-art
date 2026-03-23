"use client";

import ArtDetailView from "@/components/views/ArtDetailView";
import { useParams } from "next/navigation";

export default function ArtistArtPieceDetailPage() {
  const { artistId, artPieceId } = useParams<{
    artistId: string;
    artPieceId: string;
  }>();

  return (
    <ArtDetailView
      artPieceIdentifier={artPieceId}
      back={{
        href: `/artists/${artistId}`,
        label: "Back to artist",
      }}
    />
  );
}
