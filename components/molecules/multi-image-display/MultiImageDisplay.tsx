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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div
        className={cn(
          "relative min-h-0 w-full flex-1 overflow-hidden rounded-lg bg-muted only:min-h-[240px] md:only:min-h-[280px]",
          numUrls <= 1 && "h-full",
        )}
      >
        {isLoading ? (
          <Skeleton className="min-h-[240px] h-full w-full rounded-lg md:min-h-[280px]" />
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
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-6xl font-light font-display text-muted-foreground/50">
              {fallbackTitle ? fallbackTitle.charAt(0) : null}
            </p>
          </div>
        )}
      </div>

      {showNav && (
        <div
          className="mt-2 flex shrink-0 gap-2 overflow-x-auto pb-0.5 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5"
          role="group"
          aria-label="Gallery images"
        >
          {urls.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              aria-pressed={i === index}
              aria-label={`Image ${i + 1} of ${numUrls}`}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                i === index
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-border/80 hover:border-muted-foreground/40",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
