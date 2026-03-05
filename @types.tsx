import { Database } from "@/supabase";

export type PrintOption = Database["public"]["Enums"]["print_options"];

export const PRINT_OPTION_LABELS: Record<PrintOption, string> = {
  canvas: "Canvas",
  "framed-canvas": "Framed Canvas",
  poster: "Poster",
  "framed-poster": "Framed Poster",
};
