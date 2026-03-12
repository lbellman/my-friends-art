import { Database, Tables } from "@/supabase";
import supabase from "@/lib/supabase/server";

export type PrintOptionType = Database["public"]["Enums"]["print_options"];

export const PRINT_OPTION_LABELS: Record<PrintOptionType, string> = {
  canvas: "Canvas",
  "framed-canvas": "Framed Canvas",
  poster: "Poster",
  "framed-poster": "Framed Poster",
};

export type ArtistType = Tables<"artist">;

export type ArtPiece = Tables<"art_piece"> & {
  artist: {
    id: string;
    name: string;
    email_address: string;
  };
};

// @types.tsx
export function getPublicUrl(path: string) {
  if (!path) return "";

  // If Storybook or app passes an absolute or root-relative URL, just use it
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("/")
  ) {
    return path;
  }

  const { data } = supabase.storage.from("art-pieces").getPublicUrl(path);
  return data.publicUrl;
}
