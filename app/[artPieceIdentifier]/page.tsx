"use client";

import ArtDetailView from "@/components/views/ArtDetailView";
import { useParams, useSearchParams } from "next/navigation";

function parseSafeInternalFrom(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//")) return null;
  return trimmed;
}

function backLabelForHref(href: string): string {
  if (href.startsWith("/art/featured")) return "Back to featured";
  if (href.startsWith("/art/wall-art")) return "Back to wall art";
  if (href.startsWith("/art/all")) return "Back to all art";
  return "Back to home";
}

export default function ArtDetailPage() {
  const { artPieceIdentifier } = useParams<{ artPieceIdentifier: string }>();
  const searchParams = useSearchParams();
  const fromHref = parseSafeInternalFrom(searchParams.get("from"));
  const backHref = fromHref ?? "/";

  return (
    <ArtDetailView
      artPieceIdentifier={artPieceIdentifier}
      back={{
        href: backHref,
        label: backLabelForHref(backHref),
      }}
    />
  );
}
