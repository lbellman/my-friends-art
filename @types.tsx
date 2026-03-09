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

export function getPublicUrl(path: string) {
  const { data } = supabase.storage.from("art-pieces").getPublicUrl(path);
  return data.publicUrl;
}
