"use client";
import { ArtPiece } from "@/@types";
import AdminArtPieceCard from "@/components/molecules/pending-submission-card/AdminArtPieceCard";

export default function ArtPieceSubmissionsView({
  artPieces,
}: {
  artPieces: ArtPiece[];
}) {
  const items = artPieces ?? [];

  return (
    <div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No art pieces to display.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4 w-full">
          {items.map((artPiece: ArtPiece) => (
            <AdminArtPieceCard key={artPiece.id} artPiece={artPiece} />
          ))}
        </div>
      )}
    </div>
  );
}
