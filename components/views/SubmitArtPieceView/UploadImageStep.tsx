import { MAX_DISPLAY_IMAGES } from "@/@types";
import Tooltip from "@/components/atoms/tooltip/Tooltip";
import FileUploader from "@/components/organisms/file-uploader/FileUploader";
import { Checkbox } from "@/components/ui/checkbox";
import Step from "@/components/views/SubmitArtPieceView/Step";
import { StepPropsType } from "@/components/views/SubmitArtPieceView/SubmitArtPieceView";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function UploadImageStep({
  formData,
  setFormData,
}: StepPropsType) {
  const requiresPrintQualityImage =
    formData.product_type === "print";

  const requiresDisplayImages =
    (requiresPrintQualityImage &&
      !formData.use_print_quality_image_as_display) ||
    !requiresPrintQualityImage;

  const getPrintQualityFilesState = () => {
    const files = formData.print_quality_image
      ? [formData.print_quality_image!]
      : [];
    const setFiles = (files: File[]) => {
      setFormData({
        ...formData,
        print_quality_image: files[0],
        display_images: formData.use_print_quality_image_as_display
          ? [files[0]]
          : formData.display_images,
      });
    };
    return { files, setFiles };
  };

  const getDisplayImagesFilesState = () => {
    const files = formData.display_images ?? [];
    const setFiles = (files: File[]) => {
      setFormData({
        ...formData,
        display_images: files,
      });
    };
    return { files, setFiles };
  };

  const printQualityFilesState = getPrintQualityFilesState();
  const displayImagesFilesState = getDisplayImagesFilesState();

  // If the print quality image is being used as the display image and gets removed, clear the display images
  useEffect(() => {
    if (
      requiresPrintQualityImage &&
      (printQualityFilesState.files.length || 0) === 0
    ) {
      if (
        formData.use_print_quality_image_as_display &&
        displayImagesFilesState.files.length > 0
      ) {
        setFormData({
          ...formData,
          display_images: [],
        });
      }
    }
  }, [
    requiresPrintQualityImage,
    printQualityFilesState,
    displayImagesFilesState,
    formData.use_print_quality_image_as_display,
  ]);

  const [printQualityImageError, setPrintQualityImageError] = useState("");
  const [displayImagesError, setDisplayImagesError] = useState("");

  return (
    <Step title="Upload Image" stepNumber={3}>
      <div className="flex flex-col gap-8">
        {/* Print Quality Image Upload */}
        {requiresPrintQualityImage && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="font-semibold">
                Print Quality Image <span className="text-red-500">*</span>
              </label>
              <Tooltip
                content="This is the highest quality version of your art piece used for
              making prints. It is stored privately, and will be available for
              download on your artist dashboard."
                trigger={<InfoIcon className="size-4" />}
              />
            </div>

            <FileUploader
              files={printQualityFilesState.files}
              setFiles={printQualityFilesState.setFiles}
              error={printQualityImageError}
              setError={setPrintQualityImageError}
              supportedFileTypes={["image"]}
              maxFiles={1}
            />
          </div>
        )}
        {/* Display Images Upload */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <label className="font-semibold">
              Display Images <span className="text-red-500">*</span>
            </label>
            <Tooltip
              content="These images will be displayed publicly on the gallery."
              trigger={<InfoIcon className="size-4" />}
            />
          </div>
          {/* Use Print Quality Image as Display Image Checkbox */}
          {requiresPrintQualityImage && (
            <div className="flex gap-2 mt-2">
              <Checkbox
                checked={formData.use_print_quality_image_as_display}
                onCheckedChange={(value) =>
                  setFormData({
                    ...formData,
                    use_print_quality_image_as_display: value as boolean,
                    display_images:
                      (value as boolean) && formData.print_quality_image
                        ? [formData.print_quality_image!]
                        : [],
                  })
                }
                className="mt-1"
              />
              <div className="flex flex-col">
                <label className="body2">
                  Use the print quality image as the display image.
                </label>
                {formData.use_print_quality_image_as_display && (
                  <p className="text-xs mt-1 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-md px-3 py-2">
                    A lower-quality copy of your print image will be used as the
                    display image so as not to expose the private file.
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Display Images Upload */}
          {requiresDisplayImages && (
            <FileUploader
              files={displayImagesFilesState.files}
              setFiles={displayImagesFilesState.setFiles}
              error={displayImagesError}
              setError={setDisplayImagesError}
              supportedFileTypes={["image"]}
              maxFiles={MAX_DISPLAY_IMAGES}
            />
          )}
        </div>

        {/* Not AI Generated Checkbox */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 border-t pt-4">
            <Checkbox
              checked={formData.not_ai_generated}
              onCheckedChange={(value) =>
                setFormData({
                  ...formData,
                  not_ai_generated: value as boolean,
                })
              }
            />
            <label className="body2">
              This art piece was created by me, not AI.
            </label>
          </div>

          {/* Authorized to sell this art piece checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.authorized_to_sell}
              onCheckedChange={(value) =>
                setFormData({
                  ...formData,
                  authorized_to_sell: value as boolean,
                })
              }
            />
            <label className="body2">
              I am authorized to sell this art piece.
            </label>
          </div>
        </div>

        <p className="body2 text-muted-foreground">
          Images may take a minute to process as they go through a few
          conversion and upload steps. Please don't close this window while the
          submission is processing.
        </p>
      </div>
    </Step>
  );
}
