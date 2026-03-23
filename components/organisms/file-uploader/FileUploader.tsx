"use client";

import FileDropzone from "@/components/molecules/file-dropzone/FileDropzone";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// ----------------------------------------------------------------------
export type SupportedFileTypesType = "csv" | "image" | "doc" | "excel" | "json";

export function formatFileSize(bytes: number, decimalPoint: number) {
  if (bytes == 0) return "0 Bytes";
  const k = 1000,
    dm = decimalPoint || 2,
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function FileUploader({
  files,
  setFiles,
  error = "Files could not be uploaded. Please ensure file types are supported and that they are not larger than 10MB.",
  setError,
  supportedFileTypes = [],
  maxFiles = 1,
}: {
  files: File[];
  setFiles: (files: File[]) => void;
  error: string;
  setError: (error: string) => void;
  supportedFileTypes: SupportedFileTypesType[];
  maxFiles?: number;
}) {
  const acceptableTypes: string[] = [];
  if (supportedFileTypes.includes("csv")) acceptableTypes.push("text/csv");
  if (supportedFileTypes.includes("image"))
    acceptableTypes.push(
      ...["image/jpeg", "image/jpg", "image/png", "image/webp"],
    );
  if (supportedFileTypes.includes("excel"))
    acceptableTypes.push(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  if (supportedFileTypes.includes("json"))
    acceptableTypes.push("application/json");
  if (supportedFileTypes.includes("doc")) {
    acceptableTypes.push(
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
  }

  const maxFileSize = 10;

  const showDropzone = files.length < maxFiles;
  const renderFiles = () => {
    return files?.map((file, fileIdx) => {
      const fileUrl = URL.createObjectURL(file);
      return (
        <div className="my-1 w-full" key={fileIdx}>
          <div className="flex flex-nowrap justify-between">
            <div className="flex flex-nowrap items-center">
              {file?.type?.includes("image") && (
                <Image
                  src={fileUrl}
                  alt={file.name}
                  width={35}
                  height={35}
                  className="mr-2 rounded-sm"
                />
              )}
              <p className="body2">{file.name}</p>
            </div>
            <div>
              <Button
                variant="link"
                onClick={() => {
                  setFiles(files.filter((f) => f !== file));
                  URL.revokeObjectURL(fileUrl);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex w-full flex-col flex-nowrap">
      <div className="w-full">
        <div className="flex flex-col flex-nowrap">
          {/* Dropzone */}
          {showDropzone && (
            <FileDropzone
              supportedFileTypes={supportedFileTypes}
              maxFileSize={maxFileSize}
              onDrop={(droppedFiles: File[]) => {
                let error = "";
                if (droppedFiles.length > maxFiles) {
                  error = `Too many files. Maximum is ${maxFiles}.`;                  
                }
                droppedFiles.forEach((file) => {
                  if (!acceptableTypes.includes(file.type)) {
                    error = "One or more file types are not supported.";
                    return;
                  }
                  if (file.size > maxFileSize * 1024 * 1024) {
                    error = "One or more files are larger than 10MB.";
                    return;
                  }
                });

                setError(error);

                if (error) {
                  // Don't clear files if multiple files are allowed
                  if (files.length < maxFiles) setFiles([...files]);
                } else {
                  if (files.length < maxFiles) {
                    setFiles([...files, ...droppedFiles]);
                  } else {
                    setFiles(droppedFiles.slice(0, 1));
                  }
                }
              }}
            />
          )}
          {/* File list */}
          {error ? (
            <div className="my-1">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          ) : (
            maxFiles === 1 && renderFiles()
          )}
          {maxFiles > 1 && files.length > 0 && renderFiles()}
        </div>
      </div>
    </div>
  );
}
