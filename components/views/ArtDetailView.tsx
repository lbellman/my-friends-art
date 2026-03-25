"use client";

import {
  ArtistType,
  ArtPiece,
  getPublicUrl,
  PRODUCT_TYPE_OPTIONS,
} from "@/@types";
import Link from "@/components/atoms/link/Link";
import { ArtistCard } from "@/components/molecules/artist-card/ArtistCard";
import MultiImageDisplay from "@/components/molecules/multi-image-display/MultiImageDisplay";
import ContactArtistDialog from "@/components/organisms/contact-artist-dialog/ContactArtistDialog";
import RequestPrintDialog from "@/components/organisms/request-print-dialog/RequestPrintDialog";
import RequestToPurchaseDialog from "@/components/organisms/request-to-purchase-dialog/RequestToPurchaseDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

export default function ArtDetailView({
  artPieceIdentifier,
  back,
  previewMode = false,
}: {
  artPieceIdentifier: string;
  back: {
    href: string;
    label: string;
  };
  previewMode?: boolean;
}) {
  const { data: artPiece, isLoading: isLoadingArtPiece } = useQuery({
    queryKey: ["artPiece", artPieceIdentifier],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("art_piece")
        .select(
          "*, artist:artist_id(id, name, bio, location, profile_img_url, website, instagram, facebook, email_address), art_piece_display_image(path, idx), product_dimensions:product_dimensions_id(width_in, height_in, depth_in)",
        )
        .eq("id", artPieceIdentifier)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return {
        ...data,
        artist: data?.artist,
      } as ArtPiece;
    },
  });

  const isSellingPrint = useMemo(() => {
    return (
      artPiece?.product_type === "print-and-original" ||
      artPiece?.product_type === "print"
    );
  }, [artPiece?.product_type]);

  const isSellingOriginal = useMemo(() => {
    return (
      artPiece?.product_type === "print-and-original" ||
      artPiece?.product_type === "original"
    );
  }, [artPiece?.product_type]);

  const galleryUrls = useMemo(() => {
    const rows = [...(artPiece?.art_piece_display_image ?? [])].sort(
      (a, b) => a.idx - b.idx,
    );
    if (rows.length > 0) {
      return rows.map((r) => getPublicUrl(r.path)).filter(Boolean);
    }
    const fallback = getPublicUrl(artPiece?.display_path ?? "");
    return fallback ? [fallback] : [];
  }, [artPiece?.art_piece_display_image, artPiece?.display_path]);

  const artistAvatarUrl = useMemo(() => {
    const raw = artPiece?.artist?.profile_img_url;
    if (!raw) return "";
    return getPublicUrl(raw);
  }, [artPiece?.artist?.profile_img_url]);

  const [requestPrintDialogOpen, setRequestPrintDialogOpen] = useState(false);
  const [requestToPurchaseDialogOpen, setRequestToPurchaseDialogOpen] =
    useState(false);
  const [contactArtistDialogOpen, setContactArtistDialogOpen] = useState(false);
  const dimensions = useMemo(() => {
    return artPiece?.product_dimensions;
  }, [artPiece?.product_dimensions]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className=" py-12 px-6 max-w-6xl flex-nowrap w-full">
        {/* Back button */}
        <Link href={back.href} ariaLabel={back.label}>
          <div className="flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" />
            {back.label}
          </div>
        </Link>
        {/* Art Details */}
        <div className="grid grid-cols-1 mt-6  md:grid-cols-2 gap-6 md:gap-8 ">
          {/* Art Piece Image */}
          <div className="flex-1 flex flex-col flex-nowrap">
            <div className="relative h-full w-full aspect-3/4">
              <MultiImageDisplay
                imageSrcs={galleryUrls}
                alt={artPiece?.title || "Image of the art piece"}
                fallbackTitle={artPiece?.title ?? ""}
                isLoading={isLoadingArtPiece}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
              />
            </div>
          </div>
          {/* Details */}
          <div className="flex-1 flex flex-col rounded-lg flex-nowrap py-6 gap-4">
            {isLoadingArtPiece ? (
              <Skeleton className="w-full h-10 rounded-md" />
            ) : (
              <div className="flex flex-col flex-nowrap gap-2">
                <p className="uppercase-overline text-muted-foreground">
                  {artPiece?.medium}
                </p>
                <h5 className="font-medium">{artPiece?.title}</h5>
                {artPiece?.artist && (
                  <Link
                    href={`/artists/${artPiece?.artist_id}`}
                    className="inline-flex items-center gap-2"
                  >
                    <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                      {artistAvatarUrl ? (
                        <Image
                          src={artistAvatarUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
                          {artPiece.artist.name?.charAt(0) ?? "?"}
                        </span>
                      )}
                    </span>
                    Made by {artPiece?.artist?.name}
                  </Link>
                )}
                {artPiece?.description && (
                  <p className="body2 text-muted-foreground">
                    {artPiece?.description}
                  </p>
                )}
              </div>
            )}

            {/* Product Dimensions */}
            <div className="items-start flex flex-col">
              {/* Product Dimensions */}
              <div className="flex flex-col flex-nowrap">
                {[
                  dimensions?.width_in
                    ? {
                        label: "Width",
                        value: dimensions?.width_in
                          ? `${dimensions.width_in}"`
                          : "-",
                      }
                    : null,
                  dimensions?.height_in
                    ? {
                        label: "Height",
                        value: dimensions?.height_in
                          ? `${dimensions.height_in}"`
                          : "-",
                      }
                    : null,
                  dimensions?.depth_in
                    ? {
                        label: "Depth",
                        value: dimensions?.depth_in
                          ? `${dimensions.depth_in}"`
                          : "-",
                      }
                    : null,
                ]
                  .filter(Boolean)
                  .map(
                    (dimension) =>
                      dimension && (
                        <div
                          key={dimension?.label}
                          className="flex items-center gap-2"
                        >
                          <p className="body2 text-muted-foreground">
                            {dimension?.label}
                          </p>
                          <p className="body2 text-foreground">
                            {dimension?.value}
                          </p>
                        </div>
                      ),
                  )}
              </div>

              {/* Request a Print Button */}
              <div className="flex flex-col flex-nowrap gap-2 mt-2 w-full">
                <div className="flex w-full items-center gap-2">
                  {isSellingPrint && (
                    <Button
                      className="flex-1"
                      size="lg"
                      variant="default"
                      onClick={() => setRequestPrintDialogOpen(true)}
                      // disabled={previewMode}
                    >
                      Request a Print
                    </Button>
                  )}
                  {isSellingOriginal && (
                    <Button
                      className="flex-1"
                      size="lg"
                      variant="outline"
                      onClick={() => setRequestToPurchaseDialogOpen(true)}
                      // disabled={previewMode}
                    >
                      Request to Purchase
                    </Button>
                  )}
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  variant="outline"
                  onClick={() => setContactArtistDialogOpen(true)}
                >
                  Contact Artist
                </Button>
              </div>
            </div>
          </div>
        </div>
        {requestToPurchaseDialogOpen && (
          <RequestToPurchaseDialog
            open={requestToPurchaseDialogOpen}
            onOpenChange={setRequestToPurchaseDialogOpen}
            artPiece={artPiece as ArtPiece}
          />
        )}
        {contactArtistDialogOpen && (
          <ContactArtistDialog
            open={contactArtistDialogOpen}
            onOpenChange={setContactArtistDialogOpen}
            artist={artPiece?.artist as ArtistType}
          />
        )}
        {/* About The Artist */}
        {artPiece?.artist && (
          <section className="mt-20 border-t border-border py-12">
            <h4 className="font-display mb-6">about the artist</h4>
            <ArtistCard
              artist={artPiece?.artist as ArtistType}
              linkHref={`/artists/${artPiece?.artist_id}`}
              linkText="Go to Artist"
            />
          </section>
        )}
      </div>
    </div>
  );
}
