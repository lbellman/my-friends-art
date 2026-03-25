"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export type MultiImageDisplayProps = {
  imageSrcs: string[];
  alt: string;
  /** Used for the empty-state initial when there are no images */
  fallbackTitle?: string;
  sizes?: string;
  isLoading?: boolean;
};

export default function MultiImageDisplay({
  imageSrcs,
  alt,
  fallbackTitle = "",
  sizes = "(max-width: 640px) 100vw, 50vw",
  isLoading = false,
}: MultiImageDisplayProps) {
  const urls = useMemo(
    () => imageSrcs.filter((s): s is string => Boolean(s)),
    [imageSrcs.join("|")],
  );
  const numUrls = urls.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [urls.join("|")]);

  useEffect(() => {
    if (numUrls > 0 && index >= numUrls) setIndex(Math.max(0, numUrls - 1));
  }, [numUrls, index]);

  const currentSrc = urls[index] ?? "";
  const showNav = numUrls > 1 && !isLoading;

  return (
    <div className={cn("absolute inset-0 h-full w-full")}>
      <div
        className={cn(
          "relative w-full min-h-[240px] overflow-hidden rounded-lg bg-muted md:min-h-[280px] h-full ",
        )}
      >
        {isLoading ? (
          <Skeleton className="min-h-[240px] w-full rounded-lg md:min-h-[280px]" />
        ) : currentSrc ? (
          <>
            <Image
              src={currentSrc}
              alt={alt}
              fill
              className="object-contain min-h-full min-w-full rounded-xl"
              sizes={sizes}
            />
            {showNav && (
              <>
                <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Previous image"
                    onClick={() =>
                      setIndex((i) => (i === 0 ? numUrls - 1 : i - 1))
                    }
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </div>
                <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Next image"
                    onClick={() =>
                      setIndex((i) => (i === numUrls - 1 ? 0 : i + 1))
                    }
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex w-full items-center justify-center h-full">
            <p className="text-6xl font-light font-display text-muted-foreground/50">
              {fallbackTitle ? fallbackTitle.charAt(0) : null}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
