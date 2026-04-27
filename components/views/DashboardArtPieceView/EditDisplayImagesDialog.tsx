"use client";

import { MAX_DISPLAY_IMAGES, ProductType } from "@/@types";
import FileUploader from "@/components/organisms/file-uploader/FileUploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

async function fetchUrlsAsFiles(urls: string[]): Promise<File[]> {
  const out: File[] = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Could not load image ${i + 1}`);
    }
    const blob = await res.blob();
    const type = blob.type || "image/webp";
    const ext = type.includes("png")
      ? "png"
      : type.includes("jpeg")
        ? "jpg"
        : type.includes("webp")
          ? "webp"
          : "webp";
    out.push(new File([blob], `display-${i + 1}.${ext}`, { type }));
  }
  return out;
}

type UploadInitResponse = {
  bucket: string;
  stagingPath: string;
  uploadToken: string;
};

export default function EditDisplayImagesDialog({
  open,
  onOpenChange,
  artPieceId,
  existingDisplayUrls,
  onSuccess,
  productType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artPieceId: string;
  /** Public URLs for current display images (order = gallery order). */
  existingDisplayUrls: string[];
  onSuccess: () => void;
  productType: ProductType;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);

  const existingUrlsKey = useMemo(
    () => existingDisplayUrls.join("|"),
    [existingDisplayUrls],
  );

  useEffect(() => {
    // Reset state when dialog is closed
    if (!open) {
      setFiles([]);
      setUploadError("");
      setIsHydrating(false);
      return;
    }

    let cancelled = false;
    setUploadError("");

    // If no existing images, clear the files and stop hydration
    if (existingDisplayUrls.length === 0) {
      setFiles([]);
      setIsHydrating(false);
      return;
    }

    // Load existing images
    setIsHydrating(true);
    void (async () => {
      try {
        const existingFiles = await fetchUrlsAsFiles(existingDisplayUrls);
        if (!cancelled) setFiles(existingFiles);
      } catch {
        if (!cancelled) {
          toast.error("Could not load existing images.");
          setFiles([]);
        }
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, existingUrlsKey]);

  const handleSave = async () => {
    if (files.length < 1) {
      toast.error("Add at least one display image.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Get authenticated session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("You must be signed in.");
        return;
      }

      const token = session.access_token;

      // Stage the file in the staging bucket, and get the path
      const stageFileAndGetStagingPath = async (
        file: File,
      ): Promise<string> => {
        const stageUploadResult = await fetch(
          "/api/submit-art-piece/upload-url",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const uploadInitData = (await stageUploadResult
          .json()
          .catch(() => ({}))) as Partial<UploadInitResponse> & {
          error?: string;
        };

        if (!stageUploadResult.ok) {
          throw new Error(
            uploadInitData.error ?? "Failed to initialize image upload.",
          );
        }
        if (
          !uploadInitData.bucket ||
          !uploadInitData.stagingPath ||
          !uploadInitData.uploadToken
        ) {
          throw new Error("Invalid upload session.");
        }

        // Upload the file to the staging bucket using the staging path and signed url
        const stagingUpload = await supabase.storage
          .from(uploadInitData.bucket)
          .uploadToSignedUrl(
            uploadInitData.stagingPath,
            uploadInitData.uploadToken,
            file,
          );

        if (stagingUpload.error) {
          throw new Error("Image upload failed.");
        }

        return uploadInitData.stagingPath;
      };

      const displayStagingPaths: string[] = [];

      // For each file, upload it to the staging bucket
      for (const file of files.slice(0, MAX_DISPLAY_IMAGES)) {
        displayStagingPaths.push(await stageFileAndGetStagingPath(file));
      }

      // Call the API to update the display images in the database using the files in the staging bucket
      const res = await fetch(`/api/art-piece/${artPieceId}/display-images`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayStagingPaths }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Update failed.");
      }

      onOpenChange(false);
      toast.success("Display images updated.");
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>edit display images</DialogTitle>
          <DialogDescription>
            Edit the display images for this art piece.{" "}
            {productType === "print" &&
              "Note: This does not affect the print quality image."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">
              Display images
            </p>
            {isHydrating ? (
              <div className="space-y-2">
                <Skeleton className="h-24 w-full rounded-lg" />
                <p className="text-xs text-muted-foreground">
                  Loading current images…
                </p>
              </div>
            ) : (
              <FileUploader
                dropzoneTestId="edit-display-images-dropzone"
                files={files}
                setFiles={setFiles}
                error={uploadError}
                setError={setUploadError}
                supportedFileTypes={["image"]}
                maxFiles={MAX_DISPLAY_IMAGES}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isHydrating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSubmitting || isHydrating || files.length < 1}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
