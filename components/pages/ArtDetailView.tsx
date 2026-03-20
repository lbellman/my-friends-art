"use client";

import {
  ArtistType,
  ArtPiece,
  getPublicUrl,
  PRINT_OPTION_LABELS,
  PrintOptionType,
} from "@/@types";
import Link from "@/components/atoms/link/Link";
import { ArtistCard } from "@/components/molecules/artist-card/ArtistCard";
import RequestPrintDialog from "@/components/organisms/request-print-dialog/RequestPrintDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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
          "*, artist:artist_id(id, name, bio, location, profile_img_url, website, instagram, facebook, email_address)",
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

  const publicUrl = getPublicUrl(artPiece?.display_path ?? "");

  // Fetch dimension options when art piece is loaded
  const { data: dimensionOptions = [], isLoading: loadingDimensionOptions } =
    useQuery({
      queryKey: [
        "dimensionOptions",
        artPiece?.px_width,
        artPiece?.px_height,
        artPiece?.dpi,
        artPiece?.aspect_ratio,
      ],
      queryFn: async () => {
        if (
          !artPiece?.px_width ||
          !artPiece?.px_height ||
          !artPiece?.dpi ||
          !artPiece?.aspect_ratio
        ) {
          return [];
        }

        const { data, error } = await supabase.rpc("get_dimension_options", {
          px_width: artPiece.px_width,
          px_height: artPiece.px_height,
          dpi: artPiece.dpi,
          aspect_ratio: artPiece.aspect_ratio,
        });

        if (error) {
          throw error;
        }

        return data || [];
      },
      enabled:
        !!artPiece &&
        !!artPiece.px_width &&
        !!artPiece.px_height &&
        !!artPiece.dpi &&
        !!artPiece.aspect_ratio,
    });

  const [selectedDimension, setSelectedDimension] = useState<string | null>(
    null,
  );
  const [selectedPrintOption, setSelectedPrintOption] =
    useState<PrintOptionType | null>(null);

  const [requestPrintDialogOpen, setRequestPrintDialogOpen] = useState(false);
  // Derive default dimension during render (avoids setState in effect)
  const defaultDimension =
    dimensionOptions.length > 0
      ? `${dimensionOptions[0].width}x${dimensionOptions[0].height}`
      : "custom";
  const effectiveDimension = selectedDimension ?? defaultDimension;
  const defaultPrintOption = Object.keys(
    PRINT_OPTION_LABELS,
  )[0] as PrintOptionType;
  const effectivePrintOption = selectedPrintOption ?? defaultPrintOption;

  // Calculate price when both dimension and print option are selected
  // const { data: price, isLoading: loadingPrice } = useQuery<number | null>({
  //   queryKey: ["price", effectiveDimension, effectivePrintOption],
  //   queryFn: async () => {
  //     if (!effectiveDimension || !effectivePrintOption) {
  //       return null;
  //     }

  //     // Parse dimension string (format: "widthxheight")
  //     const [width, height] = effectiveDimension.split("x").map(Number);

  //     const { data, error } = await supabase.rpc("calculate_price", {
  //       p_height: height,
  //       p_width: width,
  //       p_print_type: effectivePrintOption,
  //     });

  //     if (error) {
  //       console.error("Price calculation error:", error);
  //       throw error;
  //     }

  //     return (data as number) ?? null;
  //   },
  //   enabled: !!effectiveDimension && !!effectivePrintOption,
  // });


  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className=" py-12 px-6 max-w-6xl flex-nowrap w-full">
        {/* Art Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 ">
          {/* Art Piece Image */}
          <div className="flex-1 flex flex-col flex-nowrap">
            {/* Back button */}
            <Link href={back.href} ariaLabel={back.label}>
              <div className="flex items-center gap-2">
                <ArrowLeftIcon className="w-4 h-4" />
                {back.label}
              </div>
            </Link>
            <div className="mt-6">
              {isLoadingArtPiece ? (
                <Skeleton className="w-full min-w-[280px] rounded-md min-h-[400px]" />
              ) : (
                <Image
                  src={publicUrl || ""}
                  alt={artPiece?.title || "Image of the art piece"}
                  width={artPiece?.px_width ?? 800}
                  height={artPiece?.px_height ?? 800}
                  className="w-full h-auto min-w-[280px] border-6 border-white object-contain rounded-xl shadow-lg shadow-black/50"
                />
              )}
            </div>
          </div>
          {/* Details */}
          <div className="flex-1 flex flex-col justify-center flex-nowrap gap-8">
            {isLoadingArtPiece ? (
              <Skeleton className="w-full h-10 rounded-md" />
            ) : (
              <div className="flex flex-col flex-nowrap gap-2">
                <h5 className="font-medium">{artPiece?.title}</h5>
                <Link href={`/artists/${artPiece?.artist_id}`}>
                  {artPiece?.artist?.name}
                </Link>
                {artPiece?.description && (
                  <p className="body2 text-muted-foreground">
                    {artPiece?.description}
                  </p>
                )}
              </div>
            )}

            {/* Dimension Selection */}
            <div className=" space-y-3">
              <label className="text-sm font-medium text-foreground">
                Dimensions
              </label>
              {loadingDimensionOptions ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-20" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {dimensionOptions.map((dim) => {
                    const dimensionValue = `${dim.width}x${dim.height}`;
                    const isSelected = effectiveDimension === dimensionValue;
                    return (
                      <Button
                        key={dimensionValue}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setSelectedDimension(dimensionValue)}
                      >
                        {dimensionValue}&quot;
                      </Button>
                    );
                  })}
                  <Button
                    variant={
                      effectiveDimension === "custom" ? "default" : "outline"
                    }
                    onClick={() => setSelectedDimension("custom")}
                  >
                    Custom
                  </Button>
                </div>
              )}
            </div>

            {/* Print Option Selection */}

            <div className="space-y-3 ">
              <label className="text-sm font-medium text-foreground">
                Print Type
              </label>
              {isLoadingArtPiece ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-32" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.keys(PRINT_OPTION_LABELS).map((option) => {
                    const isSelected = effectivePrintOption === option;
                    return (
                      <Button
                        key={option}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() =>
                          setSelectedPrintOption(option as PrintOptionType)
                        }
                        className={
                          isSelected
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : ""
                        }
                      >
                        {PRINT_OPTION_LABELS[option as PrintOptionType]}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Price Display
            <div className="flex items-center justify-between pt-2 mt-6 border-t border-border ">
              <p className="text-sm font-medium text-foreground">Subtotal</p>
              {loadingPrice ? (
                <Skeleton className="w-32 h-6" />
              ) : price !== null && price !== undefined ? (
                <p className="text-lg font-medium text-foreground">
                  ${price.toFixed(2)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">TBD</p>
              )}
            </div> */}
            </div>

            {/* Request a Print Button */}
            <div className="w-full mt-10 border-t pt-6 flex flex-col gap-2">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setRequestPrintDialogOpen(true)}
                disabled={!effectiveDimension || !effectivePrintOption}
              >
                Request a Print
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Requests are sent directly to the artist.
            </p>
          </div>
        </div>
        {requestPrintDialogOpen && (
          <RequestPrintDialog
            open={requestPrintDialogOpen}
            onOpenChange={setRequestPrintDialogOpen}
            printDetails={{
              dimensions: effectiveDimension || "",
              printOption: effectivePrintOption || "",
            }}
            artPiece={artPiece as ArtPiece}
            emailAddress={
              artPiece?.artist?.email_address || "bellmanlindsey@gmail.com"
            }
            dimensionOptions={dimensionOptions}
            loadingDimensionOptions={loadingDimensionOptions}
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
