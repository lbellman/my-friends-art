"use client";

import { useState } from "react";
import supabase from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/supabase";

type AspectRatio = Database["public"]["Enums"]["aspect_ratios"];

const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1" },
  { value: "2:3", label: "2:3" },
  { value: "3:4", label: "3:4" },
];

const DEFAULT_DPI = 300;

type DimensionOption = { width: number; height: number };

export function PrintDimensionsCalculator() {
  const [pxWidth, setPxWidth] = useState<string>("");
  const [pxHeight, setPxHeight] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("3:4");
  const [dpi, setDpi] = useState<string>(String(DEFAULT_DPI));
  const [dimensions, setDimensions] = useState<DimensionOption[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate() {
    const w = parseInt(pxWidth, 10);
    const h = parseInt(pxHeight, 10);
    const d = parseInt(dpi, 10);

    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0) {
      setError("Please enter valid pixel width and height.");
      setDimensions(null);
      return;
    }
    if (!Number.isFinite(d) || d <= 0) {
      setError("Please enter a valid DPI.");
      setDimensions(null);
      return;
    }

    setError(null);
    setIsLoading(true);
    setDimensions(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_dimension_options",
        {
          px_width: w,
          px_height: h,
          dpi: d,
          aspect_ratio: aspectRatio,
        },
      );

      if (rpcError) {
        setError(rpcError.message);
        return;
      }

      setDimensions(data ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6 shadow-sm">
      <h5 className="font-display">Print dimensions calculator</h5>
      <p className="text-sm text-muted-foreground">
        Enter your image&apos;s pixel dimensions, aspect ratio, and DPI to see
        which print sizes will be available.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="px-width" className="text-sm font-medium">
            Pixel width
          </label>
          <Input
            id="px-width"
            type="number"
            min={1}
            placeholder="e.g. 3600"
            value={pxWidth}
            onChange={(e) => setPxWidth(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="px-height" className="text-sm font-medium">
            Pixel height
          </label>
          <Input
            id="px-height"
            type="number"
            min={1}
            placeholder="e.g. 4800"
            value={pxHeight}
            onChange={(e) => setPxHeight(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="aspect-ratio" className="text-sm font-medium">
            Aspect ratio
          </label>
          <Select
            value={aspectRatio}
            onValueChange={(value) => setAspectRatio(value as AspectRatio)}
          >
            <SelectTrigger id="aspect-ratio" className="w-full">
              <SelectValue placeholder="Select aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIO_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="dpi" className="text-sm font-medium">
            DPI
          </label>
          <Input
            id="dpi"
            type="number"
            min={1}
            value={dpi}
            onChange={(e) => setDpi(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            300 is standard DPI resolution for prints. Don&apos;t alter this
            unless you have a specific reason for it.
          </p>
        </div>
      </div>

      <Button onClick={handleCalculate} disabled={isLoading}>
        {isLoading ? "Calculating…" : "Get print dimensions"}
      </Button>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {dimensions !== null && (
        <div className="flex flex-col gap-2">
          <h4 className="font-medium">
            Available print dimensions (width × height in inches)
          </h4>
          {dimensions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No print dimensions available for this resolution. Try higher
              pixel dimensions or a lower DPI.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {dimensions.map((dim) => (
                <li
                  key={`${dim.width}x${dim.height}`}
                  className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium"
                >
                  {dim.width}×{dim.height}&quot;
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
