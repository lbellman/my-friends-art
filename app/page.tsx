import { ArtCard } from "@/components/molecules/ArtCard";
import { createClient } from "@/lib/supabase/server";
import { Tables } from "@/supabase";

export type ArtPiece = Tables<"art_piece">;

export default async function Home() {
  const supabase = await createClient();
  const { data: artPieces, error } = await supabase
    .from("art_piece")
    .select("id, title, img_url, medium")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-destructive">Failed to load art: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <h1 className="mb-8 font-display text-3xl tracking-wide text-foreground md:text-4xl">
          Art pieces
        </h1>
        {!artPieces?.length ? (
          <p className="text-muted-foreground">No art pieces yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {artPieces.map((piece) => (
              <ArtCard key={piece.id} artPiece={piece as ArtPiece} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
