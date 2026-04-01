import Link from "@/components/atoms/link/Link";
import { Button } from "@/components/ui/button";
import MultiImageDisplay from "@/components/molecules/multi-image-display/MultiImageDisplay";
import { ArtPieceFormDataType } from "@/components/views/SubmitArtPieceView/SubmitArtPieceView";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ArtPiecePreview({
  formData,
  artistName,
  artistProfileImgUrl,
}: {
  formData: ArtPieceFormDataType;
  artistName: string | null;
  /** Resolved public URL for the artist profile image (optional) */
  artistProfileImgUrl?: string | null;
}) {
  const isPhysicalProduct = ["original"].includes(formData.product_type ?? "");
  const dimensions = formData.dimensions;

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  useEffect(() => {
    const files = formData.display_images ?? [];
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [formData.display_images]);

  return (
    <div className="h-full p-8 w-full flex justify-center item-center">
      <div className="bg-card w-full rounded-md shadow-md border p-6">
        <div className="flex flex-col h-full gap-2">
          <div className="w-full h-full flex items-center flex-nowrap">
            {/* Image */}
            <div className="relative h-full w-1/2 bg-muted flex rounded-lg min-h-[200px]">
              <MultiImageDisplay
                imageSrcs={previewUrls}
                alt={formData.title || "Preview"}
                fallbackTitle={formData.title}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {formData.product_type && (
                <div className="uppercase-overline absolute shadow-md right-2 top-2 z-20 bg-card rounded-full px-3 py-1">
                  {formData.product_type}
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
                  <p className="body1 flex items-center gap-2">
                    <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                      {artistProfileImgUrl ? (
                        <Image
                          src={artistProfileImgUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
                          {artistName.charAt(0)}
                        </span>
                      )}
                    </span>
                    Made by {artistName}
                  </p>
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
                ) : null}

                {/* Buttons (just for preview, no functionality) */}
                <div className="flex flex-col gap-2 flex-nowrap">
                  {formData.product_type === "original" && (
                    <Button size="default">Request to Purchase</Button>
                  )}
                  {formData.product_type === "print" && (
                    <Button size="default">Request a Print</Button>
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
