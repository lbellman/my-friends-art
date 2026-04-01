import { Database, Tables } from "@/supabase";
import supabase from "@/lib/supabase/server";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

export const MAX_DISPLAY_IMAGES = 5;
export const CHAR_LIMITS = {
  art_piece_title: 50,
  art_piece_description: 350,
  product_request_name: 50,
  product_request_message: 350,
  artist_bio: 1000,
  artist_name: 50,
};

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
    profile_img_url?: string | null;
  };
  /** Nested rows from `art_piece_display_image(path, idx)` embed */
  art_piece_display_image?: { idx: number; path: string }[] | null;
  product_dimensions: {
    width_in: number;
    height_in: number;
    depth_in: number;
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
  sold: "Sold",
};

export const ART_PIECE_STATUS_ICONS: Record<
  ArtPieceStatusType,
  React.ReactNode
> = {
  "pending-approval": <Loader2 className="size-4 text-muted-foreground" />,
  approved: <CheckCircle className="size-4 text-success-foreground" />,
  "not-approved": <XCircle className="size-4 text-destructive-foreground" />,
  sold: <CheckCircle className="size-4 text-success-foreground" />,
};

export type ProductType = Database["public"]["Enums"]["product_types"];

export const PRODUCT_TYPE_OPTIONS: Record<ProductType, string> = {
  print: "Print (digital item, can be printed multiple times)",
  original: "Original (single item, can only be sold once)",
  "print-and-original":
    "Print and Original (prints are available, original is also available)",
  "made-to-order": "Made to Order (custom order, fulfilled on request)",
};

export type ArtPieceCategoryType =
  Database["public"]["Enums"]["art_piece_categories"];
export const ART_PIECE_CATEGORY_LABELS: Record<ArtPieceCategoryType, string> = {
  "wall-art": "Wall Art",
  "sculpture-and-ceramics": "Sculpture & Ceramics",
  "textiles-and-fiber": "Textiles & Fiber",
  "clothing-and-wearables": "Clothing & Wearables",
  jewelry: "Jewelry",
  "home-and-decor": "Home & Decor",
  furniture: "Furniture",
  "paper-goods": "Paper Goods",
  other: "Other",
};

export type ArtPieceSizeType = Database["public"]["Enums"]["art_piece_sizes"];
export const ART_PIECE_SIZE_LABELS: Record<ArtPieceSizeType, string> = {
  "made-to-measure": "Made to Measure",
  "one-size": "One Size",
  xs: "XS",
  sm: "S",
  md: "M",
  lg: "L",
  xl: "XL",
  "childs-xs": "Child - XS",
  "childs-sm": "Child - S",
  "childs-md": "Child - M",
  "childs-lg": "Child - L",
  "childs-xl": "Child - XL",
  "womans-xs": "Woman - XS",
  "womans-sm": "Woman - S",
  "womans-md": "Woman - M",
  "womans-lg": "Woman - L",
  "womans-xl": "Woman - XL",
  "mens-xs": "Man - XS",
  "mens-sm": "Man - S",
  "mens-md": "Man - M",
  "mens-lg": "Man - L",
  "mens-xl": "Man - XL",
  other: "Other",
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
