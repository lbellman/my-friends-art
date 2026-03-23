import { Database, Tables } from "@/supabase";
import supabase from "@/lib/supabase/server";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

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

export type MediumType = Database["public"]["Enums"]["art_mediums"];

// TODO: Add back the physical mediums when original products are supported
export const MEDIUM_OPTIONS: Record<MediumType, string> = {
  digital: "Digital",
  oil: "Oil",
  acrylic: "Acrylic",
  watercolor: "Watercolor",
  pastel: "Pastel",
  pencil: "Pencil",
  "mixed-media": "Mixed Media",
  "needle-felt": "Needle Felt",
  crochet: "Crochet",
  knit: "Knit",
  pen: "Pen",
  wood: "Wood",
  clay: "Clay",
  "paper-machet": "Paper Machet",
  pottery: "Pottery",
  other: "Other",
};

export type ProductRequestRow =
  Database["public"]["Tables"]["product_request"]["Row"];
export type ProductRequestStatusType =
  Database["public"]["Enums"]["product_request_statuses"];
export const PRODUCT_REQUEST_STATUS_OPTIONS: Record<
  ProductRequestStatusType,
  string
> = {
  pending: "Pending",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
  "email-failed": "Email Failed",
};

export type ArtPieceStatusType =
  Database["public"]["Enums"]["art_piece_statuses"];
export const ART_PIECE_STATUS_OPTIONS: Record<ArtPieceStatusType, string> = {
  "pending-approval": "Pending Approval",
  approved: "Approved",
  "not-approved": "Not Approved",
};

export const ART_PIECE_STATUS_ICONS: Record<
  ArtPieceStatusType,
  React.ReactNode
> = {
  "pending-approval": <Loader2 className="size-4 text-muted-foreground" />,
  approved: <CheckCircle className="size-4 text-success-foreground" />,
  "not-approved": <XCircle className="size-4 text-destructive-foreground" />,
};

export type ProductType = Database["public"]["Enums"]["product_types"];

export const PRODUCT_TYPE_OPTIONS: Record<NonNullable<ProductType>, string> = {
  print: "Print (digital item, can be sold multiple times)",
  original: "Original (physical item, can only sell once)",
  "print-and-original":
    "Print and Original (prints are available, original is also available)",
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
