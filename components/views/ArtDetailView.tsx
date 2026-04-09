"use client";

import {
  ART_PIECE_CATEGORY_LABELS,
  ART_PIECE_SIZE_LABELS,
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
import DimensionsSingleSelect, {
  resolveDimensionSelectValue,
} from "@/components/molecules/dimensions-single-select/DimensionsSingleSelect";
import QualityChart from "@/components/molecules/quality-chart/QualityChart";
import RequestToPurchaseDialog from "@/components/organisms/request-to-purchase-dialog/RequestToPurchaseDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function ArtDetailView({
  artPieceIdentifier,
  back,
}: {
  artPieceIdentifier: string;
  back: {
    href: string;
    label: string;
  };
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
    return artPiece?.product_type === "print";
  }, [artPiece?.product_type]);

  const galleryUrls = useMemo(() => {
    const rows = [...(artPiece?.art_piece_display_image ?? [])].sort(
      (a, b) => a.idx - b.idx,
    );
    if (rows.length > 0) {
      return rows.map((r) => getPublicUrl('art-pieces', r.path)).filter(Boolean);
    }
    const fallback = getPublicUrl('art-pieces', artPiece?.display_path ?? "");
    return fallback ? [fallback] : [];
  }, [artPiece?.art_piece_display_image, artPiece?.display_path]);

  const artistAvatarUrl = useMemo(() => {
    const raw = artPiece?.artist?.profile_img_url;
    if (!raw) return "";
    return getPublicUrl('profile-pictures', raw);
  }, [artPiece?.artist?.profile_img_url]);

  const [requestPrintDialogOpen, setRequestPrintDialogOpen] = useState(false);
  const [requestToPurchaseDialogOpen, setRequestToPurchaseDialogOpen] =
    useState(false);
  const [requestCustomOrderDialogOpen, setRequestCustomOrderDialogOpen] =
    useState(false);
  const [contactArtistDialogOpen, setContactArtistDialogOpen] = useState(false);
  const [printDimensions, setPrintDimensions] = useState("");
  const dimensions = useMemo(() => {
    return artPiece?.product_dimensions;
  }, [artPiece?.product_dimensions]);

  const shouldRenderPhysicalDimensions =
    !!dimensions?.width_in || !!dimensions?.height_in || !!dimensions?.depth_in;

  const dimensionsSection = useMemo(() => {
    if (!dimensions) return null;
    const rows = [
      dimensions.width_in
        ? {
            label: "Width ",
            value: `${dimensions.width_in}"`,
          }
        : null,
      dimensions.height_in
        ? {
            label: "Height ",
            value: `${dimensions.height_in}"`,
          }
        : null,
      dimensions.depth_in
        ? {
            label: "Depth ",
            value: `${dimensions.depth_in}"`,
          }
        : null,
    ].filter(Boolean) as { label: string; value: string }[];

    return rows.map((dimension) => (
      <div key={dimension.label} className="flex items-center gap-2">
        <p className="body2 text-muted-foreground">{dimension.label}</p>
        <p className="body2 text-foreground">{dimension.value}</p>
      </div>
    ));
  }, [dimensions]);

  useEffect(() => {
    if (!artPiece || !isSellingPrint) return;
    setPrintDimensions(
      resolveDimensionSelectValue("", artPiece.px_width, artPiece.px_height),
    );
  }, [artPiece?.id, artPiece?.px_width, artPiece?.px_height, isSellingPrint]);

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
        <div className="grid grid-cols-1 items-start mt-6 md:grid-cols-2 gap-6 md:gap-8 ">
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
              {artPiece?.product_type && (
                <div className="uppercase-overline absolute shadow-md right-2 top-2 z-2 bg-card rounded-full px-3 py-1">
                  {artPiece.product_type.replaceAll("-", " ")}
                </div>
              )}
            </div>
          </div>
          {/* Details */}
          <div className="flex-1 flex flex-col rounded-lg flex-nowrap py-6 gap-8">
            {isLoadingArtPiece ? (
              <Skeleton className="w-full h-10 rounded-md" />
            ) : (
              <div className="flex flex-col flex-nowrap gap-2">
                {artPiece?.category ? (
                  <p className="uppercase-overline text-muted-foreground">
                    {ART_PIECE_CATEGORY_LABELS[artPiece.category]}
                  </p>
                ) : null}
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
                  <p className="body2 text-muted-foreground mt-4">
                    {artPiece?.description}
                  </p>
                )}

                {artPiece?.product_type &&
                artPiece.product_type !== "print" &&
                (artPiece.size || shouldRenderPhysicalDimensions) ? (
                  <div className="flex flex-col flex-nowrap gap-1">
                    {artPiece.size ? (
                      <p className="body2 text-foreground">
                        <span className="text-muted-foreground mr-1">
                          Size{" "}
                        </span>
                        {ART_PIECE_SIZE_LABELS[artPiece.size]}
                      </p>
                    ) : null}
                    {shouldRenderPhysicalDimensions ? dimensionsSection : null}
                  </div>
                ) : null}
              </div>
            )}

            <div className="items-start flex flex-col">
              {isSellingPrint && artPiece && !isLoadingArtPiece ? (
                <>
                  <DimensionsSingleSelect
                    id="art-detail-print-dimensions"
                    label="Print size"
                    value={printDimensions}
                    onChange={setPrintDimensions}
                    pxWidth={artPiece.px_width}
                    pxHeight={artPiece.px_height}
                  />
                  <div className="mt-2 w-full">
                    <QualityChart />
                  </div>
                </>
              ) : null}

              {/* Request a Print Button */}
              <div className="flex flex-col flex-nowrap gap-2 mt-2 w-full">
                <div className="flex w-full items-center gap-2">
                  {artPiece?.product_type === "print" && (
                    <Button
                      className="flex-1"
                      size="lg"
                      variant="default"
                      onClick={() => setRequestPrintDialogOpen(true)}
                      disabled={isLoadingArtPiece}
                    >
                      Request a Print
                    </Button>
                  )}
                  {artPiece?.product_type === "original" && (
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={() => setRequestToPurchaseDialogOpen(true)}
                      disabled={isLoadingArtPiece}
                    >
                      Request to Purchase
                    </Button>
                  )}
                  {artPiece?.product_type === "made-to-order" && (
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={() => setRequestCustomOrderDialogOpen(true)}
                      disabled={isLoadingArtPiece}
                    >
                      Request a Custom Order
                    </Button>
                  )}
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  variant="outline"
                  disabled={isLoadingArtPiece}
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
            emailAddress={artPiece?.artist?.email_address ?? ""}
          />
        )}
        {requestCustomOrderDialogOpen && (
          <RequestToPurchaseDialog
            open={requestCustomOrderDialogOpen}
            onOpenChange={setRequestCustomOrderDialogOpen}
            artPiece={artPiece as ArtPiece}
            emailAddress={artPiece?.artist?.email_address ?? ""}
            isCustomOrder={true}
          />
        )}
        {contactArtistDialogOpen && (
          <ContactArtistDialog
            open={contactArtistDialogOpen}
            onOpenChange={setContactArtistDialogOpen}
            artist={artPiece?.artist as ArtistType}
          />
        )}
        {isSellingPrint && artPiece && (
          <RequestPrintDialog
            open={requestPrintDialogOpen}
            onOpenChange={setRequestPrintDialogOpen}
            artPiece={artPiece as ArtPiece}
            emailAddress={artPiece.artist?.email_address ?? ""}
            pxWidth={artPiece.px_width}
            pxHeight={artPiece.px_height}
            dimensions={printDimensions}
            onDimensionsChange={setPrintDimensions}
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
