"use client";

import ArtDetailView from "@/components/pages/ArtDetailView";
import { useParams } from "next/navigation";

export default function ArtDetailPage() {
  const { artPieceIdentifier } = useParams<{ artPieceIdentifier: string }>();

  return (
    <ArtDetailView
      artPieceIdentifier={artPieceIdentifier}
      back={{
        href: "/",
        label: "Back to home",
      }}
    />
  );
}
