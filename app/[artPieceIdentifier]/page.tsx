"use client";

import { useParams } from "next/navigation";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import InternalLayout from "@/components/organisms/InternalLayout";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PRINT_OPTION_LABELS, PrintOptionType } from "@/@types";
import _ from "lodash";
import Link from "@/components/atoms/Link";
import { ArrowLeftIcon } from "lucide-react";
import RequestPrintDialog from "@/components/organisms/RequestPrintDialog";

export default function ArtDetailPage() {
  const { artPieceIdentifier } = useParams<{ artPieceIdentifier: string }>();

  const { data: artPiece, isLoading: isLoadingArtPiece } = useQuery({
    queryKey: ["artPiece", artPieceIdentifier],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("art_piece")
        .select("*")
        .eq("id", artPieceIdentifier)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

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
      : null;
  const effectiveDimension = selectedDimension ?? defaultDimension;
  const defaultPrintOption = Object.keys(PRINT_OPTION_LABELS)[0] as PrintOptionType;
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
    <InternalLayout>
      <div className="flex flex-col flex-nowrap w-full">
        {/* Art Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 ">
          {/* Art Piece Image */}
          <div className="flex-1 flex flex-col flex-nowrap">
            {/* Back button */}
            <Link href="/" ariaLabel="Back to home">
              <div className="flex items-center gap-2">
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Gallery
              </div>
            </Link>
            <div className="mt-6">
              {isLoadingArtPiece ? (
                <Skeleton className="w-full h-full object-cover rounded-md min-h-[500px]" />
              ) : (
                <Image
                  src={artPiece?.img_url || ""}
                  alt={artPiece?.title || "Image of the art piece"}
                  width={500}
                  height={500}
                  className="max-h-[600px] w-full h-full object-cover rounded-md shadow-lg"
                />
              )}
            </div>
          </div>
          {/* Details */}
          <div className="flex-1 flex flex-col justify-center flex-nowrap gap-8">
            {isLoadingArtPiece ? (
              <Skeleton className="w-full h-10 rounded-md" />
            ) : (
              <h2>{artPiece?.title}</h2>
            )}
            {/* Dimension Selection */}
            {dimensionOptions.length > 0 && (
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
                  </div>
                )}
              </div>
            )}

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
              {/* Request a Print Button */}
              <div className="w-full mt-10 border-t pt-6 ">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setRequestPrintDialogOpen(true)}
                  disabled={!effectiveDimension || !effectivePrintOption}
                >
                  Request a Print
                </Button>
              </div>
            </div>
          </div>
        </div>
        {requestPrintDialogOpen && (
          <RequestPrintDialog
            open={requestPrintDialogOpen}
            onOpenChange={setRequestPrintDialogOpen}
            printDetails={{
              title: artPiece?.title || "",
              dimensions: effectiveDimension || "",
              printOption: effectivePrintOption || "",
            }}
            dimensionOptions={dimensionOptions}
            loadingDimensionOptions={loadingDimensionOptions}
          />
        )}
        {/* About The Artist */}
        <section className="mt-20 border-t border-border py-12">
          <div className="flex flex-col flex-nowrap gap-10 ">
            <div className="flex items-center justify-between">
              <h2 className="font-display">about the artist</h2>
              <Link href="/artists">Go to Artists</Link>
            </div>
            <div className="flex flex-col md:flex-row flex-nowrap gap-6">
              <Image
                src={"/headshot.webp"}
                alt="Lindsey"
                width={150}
                height={150}
                className="rounded-lg aspect-square object-cover"
              />
              <div className="flex flex-col flex-nowrap gap-4">
                <h3>Lindsey Bellman</h3>
                <p className="text-sm text-muted-foreground max-w-3xl">
                  I’m Lindsey, an artist and creator based in British Columbia.
                  I work across painting, digital art, and photography, drawing
                  on nature, light, and everyday moments for inspiration. My
                  prints are made to bring a bit of that feeling into your
                  space—whether it’s a landscape, an abstract piece, or
                  something in between. Thanks for being here and for supporting
                  independent art.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </InternalLayout>
  );
}
