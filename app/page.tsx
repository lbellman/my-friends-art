import { ArtCard } from "@/components/molecules/ArtCard";
import supabase from "@/lib/supabase/server";
import { Tables } from "@/supabase";

export type ArtPiece = Tables<"art_piece">;

export default async function Home() {
  const { data: artPieces, error } = await supabase
    .from("art_piece")
    .select("id, title, img_url, medium")
    .order("created_at", { ascending: false });

  // If environment is local, show the error in the console
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl min-h-screen flex justify-center items-center ">
        <div className="bg-primary/10 px-12 py-10 flex flex-col gap-2 items-center rounded-md">
          <h4 className="text-primary-foreground">Something went wrong.</h4>
          <p className="text-primary-foreground">Please try again later.</p>
        </div>
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
