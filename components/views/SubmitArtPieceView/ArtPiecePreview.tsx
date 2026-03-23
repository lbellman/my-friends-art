import Link from "@/components/atoms/link/Link";
import { Button } from "@/components/ui/button";
import { ArtPieceFormDataType } from "@/components/views/SubmitArtPieceView/SubmitArtPieceView";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ArtPiecePreview({
  formData,
  artistName,
}: {
  formData: ArtPieceFormDataType;
  artistName: string | null;
}) {
  const isPhysicalProduct = ["original", "print-and-original"].includes(
    formData.product_type ?? "",
  );
  const [currentDisplayImageIndex, setCurrentDisplayImageIndex] = useState(0);
  const dimensions = formData.dimensions;

  const numDisplayImages = formData.display_images?.length ?? 0;

  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    if (formData.display_images?.[currentDisplayImageIndex]) {
      setUrl(
        URL.createObjectURL(formData.display_images[currentDisplayImageIndex]),
      );
    } else if (formData.display_images?.[0]) {
      setUrl(URL.createObjectURL(formData.display_images[0]));
    } else {
      setUrl("");
    }
  }, [formData.display_images, currentDisplayImageIndex]);

  return (
    <div className="h-full p-8 w-full flex justify-center item-center">
      <div className="bg-card w-full rounded-md shadow-md border p-6">
        <div className="flex flex-col h-full gap-2">
          <div className="w-full h-full flex items-center flex-nowrap">
            {/* Image */}
            <div className="relative h-full w-1/2 bg-muted flex items-center rounded-lg">
              {(formData.display_images?.length ?? 0) > 0 ? (
                <>
                  <Image
                    src={url}
                    alt={formData.title}
                    width={1000}
                    height={1000}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  {numDisplayImages > 1 && (
                    <>
                      <div className="absolute left-4 top-1/2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (currentDisplayImageIndex === 0) {
                              setCurrentDisplayImageIndex(numDisplayImages - 1);
                            } else {
                              setCurrentDisplayImageIndex(
                                currentDisplayImageIndex - 1,
                              );
                            }
                          }}
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                      </div>
                      <div className="absolute right-4 top-1/2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (
                              currentDisplayImageIndex ===
                              numDisplayImages - 1
                            ) {
                              setCurrentDisplayImageIndex(0);
                            } else {
                              setCurrentDisplayImageIndex(
                                currentDisplayImageIndex + 1,
                              );
                            }
                          }}
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                  <h3 className="font-display text-muted-foreground">
                    {formData.title.charAt(0)}
                  </h3>
                </div>
              )}
              {formData.product_type && (
                <div className="uppercase-overline absolute shadow-md right-2 top-2 bg-card rounded-full px-3 py-1">
                  {formData.product_type === "print-and-original"
                    ? "Print / Original"
                    : formData.product_type}
                </div>
              )}
            </div>
            {/* Details */}
            <div className=" h-full w-1/2 ml-6">
              <div className="flex h-full flex-col gap-4 flex-nowrap justify-center">
                {/* Medium */}
                {formData.medium ? (
                  <p className="uppercase-overline text-muted-foreground">
                    {formData.medium}
                  </p>
                ) : (
                  <div className="bg-muted h-5 w-1/2 rounded-sm" />
                )}
                {/* Title */}
                {formData.title ? (
                  <h5 className="font-medium">{formData.title}</h5>
                ) : (
                  <div className="bg-muted h-10 w-full rounded-sm" />
                )}

                {/* Artist */}
                {artistName &&
                formData.authorized_to_sell &&
                formData.not_ai_generated ? (
                  <p className="body1">Made by {artistName}</p>
                ) : (
                  <div className="bg-muted h-5 w-full rounded-sm" />
                )}

                {/* Description */}
                {formData.description ? (
                  <p className="body2 text-muted-foreground">
                    {formData.description}
                  </p>
                ) : (
                  <div className="bg-muted h-24 w-full rounded-sm" />
                )}

                {/* Dimensions */}
                {formData.product_type && formData.product_type !== "print" ? (
                  <div className="flex flex-col flex-nowrap">
                    {[
                      {
                        label: "Width",
                        value: dimensions?.width_in
                          ? `${dimensions.width_in}"`
                          : "-",
                      },
                      {
                        label: "Height",
                        value: dimensions?.height_in
                          ? `${dimensions.height_in}"`
                          : "-",
                      },
                      {
                        label: "Depth",
                        value: dimensions?.depth_in
                          ? `${dimensions.depth_in}"`
                          : "-",
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center gap-2">
                        <p className="body2 text-muted-foreground">{label}</p>
                        <p className="body2 text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Buttons (just for preview, no functionality) */}
                <div className="flex flex-col gap-2 flex-nowrap">
                  {isPhysicalProduct && (
                    <Button variant="outline" size="default">
                      Request Original
                    </Button>
                  )}
                  {(formData.product_type === "print" ||
                    formData.product_type === "print-and-original") && (
                    <Button variant="outline" size="default">
                      Request a Print
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
