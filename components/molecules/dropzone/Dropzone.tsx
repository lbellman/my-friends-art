"use client";
import {
  Dropzone as DropzonePrimitive,
  DropZoneArea,
  DropzoneDescription,
  DropzoneFileList,
  DropzoneFileListItem,
  DropzoneMessage,
  DropzoneRemoveFile,
  DropzoneTrigger,
  useDropzone,
} from "@/components/ui/dropzone";
import { CloudUploadIcon, Trash2Icon } from "lucide-react";

export function Dropzone({
  setFile,
}: {
  setFile: (file: File | null) => void;
}) {
  const dropzone = useDropzone({
    onDropFile: (file: File) => {
      setFile(file);
      return Promise.resolve({
        status: "success",
        result: URL.createObjectURL(file),
      });
    },
    validation: {
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".webp"],
      },
      maxSize: 10 * 1024 * 1024,
      maxFiles: 1,
    },
  });

  return (
    <div className="not-prose flex flex-col gap-4">
      <DropzonePrimitive {...dropzone}>
        <div>
          <div className="flex justify-between">
            <DropzoneDescription>Select an image to upload</DropzoneDescription>
            <DropzoneMessage />
          </div>
          <DropZoneArea>
            <DropzoneTrigger className="flex flex-col items-center gap-4 bg-transparent p-10 text-center text-sm">
              <CloudUploadIcon className="size-8" />
              <div>
                <p className="font-semibold">Upload your art piece</p>
                <p className="body2 text-muted-foreground font-normal">
                  Accepted formats: .png, .jpg, .jpeg, .webp
                </p>
                <p className="body2 text-muted-foreground font-normal">Max size: 10MB</p>
              </div>
            </DropzoneTrigger>
          </DropZoneArea>
        </div>

        <DropzoneFileList className="grid grid-cols-3 gap-3 p-0">
          {dropzone.fileStatuses.map((file) => (
            <DropzoneFileListItem
              className="overflow-hidden rounded-md bg-muted p-0 border shadow-sm"
              key={file.id}
              file={file}
            >
              {file.status === "pending" && (
                <div className="aspect-video animate-pulse bg-black/20" />
              )}
              {file.status === "success" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.result}
                  alt={`uploaded-${file.fileName}`}
                  className="aspect-video object-cover"
                />
              )}
              <div className="flex items-center justify-between p-2 pl-4">
                <div className="min-w-0">
                  <p className="truncate text-sm">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <DropzoneRemoveFile
                  variant="ghost"
                  className="shrink-0 hover:outline"
                  
                >
                  <Trash2Icon className="size-4" />
                </DropzoneRemoveFile>
              </div>
            </DropzoneFileListItem>
          ))}
        </DropzoneFileList>
      </DropzonePrimitive>
    </div>
  );
}
