"use client";

import { useDropzone } from "react-dropzone";
import { type SupportedFileTypesType } from "@/components/organisms/file-uploader/FileUploader";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function FileDropzone({
  supportedFileTypes,
  onDrop,
  maxFileSize,
  dataTestId,
}: {
  onDrop: (acceptedFiles: File[]) => void;
  supportedFileTypes?: SupportedFileTypesType[];
  maxFileSize?: number;
  /** For Playwright: scope `input[type="file"]` under this dropzone root. */
  dataTestId?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  // Mark component as mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const fileTypes = [];
  if (supportedFileTypes?.includes("csv")) fileTypes.push("csv");
  if (supportedFileTypes?.includes("image"))
    fileTypes.push(["jpg", "jpeg", "png", "webp"]);
  if (supportedFileTypes?.includes("excel")) fileTypes.push("xlsx");
  if (supportedFileTypes?.includes("json")) fileTypes.push("json");
  if (supportedFileTypes?.includes("doc")) fileTypes.push("docx");

  // Keep `input` + getRootProps in the tree from the first paint so E2E can
  // `setInputFiles` immediately; only swap inner copy until mounted (hydration).
  return (
    <div className="h-full min-h-full" data-testid={dataTestId}>
      <div className="flex h-full items-center justify-center">
        <div
          className="h-full w-full cursor-pointer rounded-lg border border-dashed border-border p-6"
          {...getRootProps()}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center">
            {!mounted ? (
              <>
                <p className="body2 text-center">Loading file uploader...</p>
                <Button variant="outline" className="mt-1" size="sm">
                  Browse Files
                </Button>
              </>
            ) : (
              <>
                {isDragActive ? (
                  <PlusIcon />
                ) : (
                  <>
                    <p className="body2 text-center">Drag and drop</p>
                    <p className="body2 mt-1 text-center">OR</p>
                  </>
                )}
                <Button variant="outline" className="mt-1" type="button">
                  Browse Files
                </Button>
                {supportedFileTypes && fileTypes.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1 items-center">
                    <p className="text-xs text-muted-foreground">
                      Supported file types: {fileTypes.join(", ")}
                    </p>
                    {maxFileSize && (
                      <p className="text-xs text-muted-foreground">
                        Max file size: {maxFileSize}MB
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
