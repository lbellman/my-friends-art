import {
  ArtPieceCategoryType,
  ArtPieceSizeType,
  getPublicUrl,
  MAX_DISPLAY_IMAGES,
  ProductType,
} from "@/@types";
import useAuth from "@/app/hooks/useAuth";
import Button from "@/components/atoms/button/Button";
import { Skeleton } from "@/components/ui/skeleton";
import ArtPiecePreview from "@/components/views/SubmitArtPieceView/ArtPiecePreview";
import BasicInformationStep from "@/components/views/SubmitArtPieceView/BasicInformationStep";
import OriginalProductDetailsStep from "@/components/views/SubmitArtPieceView/OriginalProductDetailsStep";
import UploadImageStep from "@/components/views/SubmitArtPieceView/UploadImageStep";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type ArtPieceFormDataType = {
  title: string;
  description: string;
  category: ArtPieceCategoryType | null;
  product_type: ProductType | null;
  not_ai_generated: boolean;
  authorized_to_sell: boolean;
  print_quality_image?: File | null;
  use_print_quality_image_as_display?: boolean;
  display_images?: File[];
  size: ArtPieceSizeType | null;

  // For physical art pieces
  price?: number | null;
  price_includes_shipping?: boolean;
  dimensions?: {
    width_in?: number;
    height_in?: number;
    depth_in?: number;
  } | null;
};

export type StepPropsType = {
  formData: ArtPieceFormDataType;
  setFormData: (data: ArtPieceFormDataType) => void;
  setStep: (step: StepType) => void;
};

type StepType =
  | "basic-information"
  | "original-product-details"
  | "upload-image";

function getRequiresPrintQualityImage(
  productType: ProductType | null,
): boolean {
  return productType === "print";
}

function getRequiresDisplayImages(formData: ArtPieceFormDataType): boolean {
  const needsPrint = getRequiresPrintQualityImage(formData.product_type);
  return (
    (needsPrint && !formData.use_print_quality_image_as_display) || !needsPrint
  );
}

type UploadInitResponse = {
  bucket: string;
  stagingPath: string;
  uploadToken: string;
};

export default function SubmitArtPieceView() {
  const router = useRouter();
  const { user, loading: isLoadingUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: artist, isLoading: isLoadingArtist } = useQuery({
    queryKey: ["artist", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("artist")
        .select("name, profile_img_url")
        .eq("user_id", user?.id || "")
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Redirect to home if user is not logged in
  useEffect(() => {
    if (!user && !isLoadingUser) {
      redirect("/");
    }
  }, [user, isLoadingUser]);

  const [step, setStep] = useState<StepType>("basic-information");
  const [formData, setFormData] = useState<ArtPieceFormDataType>({
    title: "",
    description: "",
    product_type: null,
    category: null,
    size: null,
    not_ai_generated: false,
    authorized_to_sell: false,
    print_quality_image: null,
    display_images: [],
    use_print_quality_image_as_display: true,
    price: null,
    price_includes_shipping: false,
    dimensions: null,
  });

  const stepProps: StepPropsType = {
    formData,
    setFormData,
    setStep,
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!formData.title.trim()) {
      setSubmitError("Title is required.");
      return;
    }

    if (!formData.category) {
      setSubmitError("Category is required.");
      return;
    }

    if (!formData.product_type) {
      setSubmitError("Product type is required.");
      return;
    }

    const requiresPrintQualityImage = getRequiresPrintQualityImage(
      formData.product_type,
    );
    const requiresDisplayImages = getRequiresDisplayImages(formData);

    if (requiresPrintQualityImage && !formData.print_quality_image) {
      setSubmitError("Please upload a print-quality image.");
      return;
    }
    if (requiresDisplayImages && (formData.display_images?.length ?? 0) < 1) {
      setSubmitError("Please upload at least one display image.");
      return;
    }
    if (
      formData.display_images?.length &&
      formData.display_images.length > MAX_DISPLAY_IMAGES
    ) {
      setSubmitError("You can only upload up to 5 display images.");
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setSubmitError("You must be signed in to submit art.");
        return;
      }

      const token = session.access_token;
      const getFileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

      // { fileKey: stagingPath }
      const stagedPathByFileKey = new Map<string, string>();

      // Upload the file to a private staging bucket
      const stageFileAndGetStagingPath = async (
        file: File,
      ): Promise<string> => {
        const key = getFileKey(file);
        const existing = stagedPathByFileKey.get(key);
        if (existing) return existing;

        // Get a signed upload URL and staging path for the file
        const uploadInitRes = await fetch("/api/submit-art-piece/upload-url", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        const uploadInitData = (await uploadInitRes
          .json()
          .catch(() => ({}))) as Partial<UploadInitResponse> & {
          error?: string;
        };

        if (!uploadInitRes.ok) {
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

        // Add the staging path to the map
        stagedPathByFileKey.set(key, uploadInitData.stagingPath);
        return uploadInitData.stagingPath;
      };

      // For each display image, upload it to the staging bucket and get the staging path
      // Limit to 5 display images (this is already enforced on the client side, but another sanity check is nice)
      const displayStagingPaths: string[] = [];
      for (const file of (formData.display_images ?? []).slice(
        0,
        MAX_DISPLAY_IMAGES,
      )) {
        displayStagingPaths.push(await stageFileAndGetStagingPath(file));
      }

      // Upload the print quality image to the staging bucket and get the staging path
      let printQualityStagingPath: string | null = null;
      if (requiresPrintQualityImage && formData.print_quality_image) {
        printQualityStagingPath = await stageFileAndGetStagingPath(
          formData.print_quality_image,
        );
      }

      // Submit the art piece to the server with the print quality staging path and display staging paths
      const res = await fetch("/api/submit-art-piece", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          size: formData.size,
          product_type: formData.product_type,
          not_ai_generated: formData.not_ai_generated,
          authorized_to_sell: formData.authorized_to_sell,
          price: formData.price ?? null,
          price_includes_shipping: formData.price_includes_shipping ?? false,
          dimensions: formData.dimensions ?? null,
          displayStagingPaths,
          printQualityStagingPath,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 413) {
          setSubmitError(
            "Submission payload is too large. Please retry with smaller images.",
          );
          return;
        }
        setSubmitError(data.error ?? "Submission failed. Please try again.");
        return;
      }
      router.push("/submit-art-piece/success");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === "basic-information") {
      if (formData.product_type !== "print") {
        setStep("original-product-details");
      } else {
        setStep("upload-image");
      }
    } else if (step === "original-product-details") {
      setStep("upload-image");
    }
  };
  const handlePrevious = () => {
    if (step === "upload-image") {
      if (formData.product_type !== "print") {
        setStep("original-product-details");
      } else {
        setStep("basic-information");
      }
    } else if (step === "original-product-details") {
      setStep("basic-information");
    }
    return;
  };

  const getIsNextDisabled = () => {
    if (step === "basic-information") {
      return (
        !formData.title ||
        !formData.description ||
        !formData.product_type ||
        !formData.category
      );
    }
    if (step === "original-product-details") {
      return false;
    }
    if (step === "upload-image") {
      const requiresPrintQualityImage = getRequiresPrintQualityImage(
        formData.product_type,
      );
      const requiresDisplayImages = getRequiresDisplayImages(formData);
      const printOk =
        !requiresPrintQualityImage || !!formData.print_quality_image;
      const displayOk =
        !requiresDisplayImages || (formData.display_images?.length ?? 0) > 0;
      return (
        !printOk ||
        !displayOk ||
        !formData.not_ai_generated ||
        !formData.authorized_to_sell
      );
    }
    return true;
  };

  // Disable automatic form submission on enter key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
  }, []);

  return isLoadingUser ? null : (
    <div className="flex w-full h-page-height-navbar">
      {/* Editable Panel */}
      <div className="w-full relative md:w-1/3 bg-card border-r flex flex-col ">
        <div
          className="overflow-y-auto mb-10"
          style={{
            maxHeight: "calc(100vh - 190px)",
          }}
        >
          {step === "basic-information" && (
            <BasicInformationStep {...stepProps} />
          )}
          {step === "original-product-details" && (
            <OriginalProductDetailsStep {...stepProps} />
          )}
          {step === "upload-image" && <UploadImageStep {...stepProps} />}
        </div>

        {/* Buttons */}
        <div className=" absolute bottom-6 justify-between left-6 right-6 flex flex-col md:flex-row">
          <div className="flex flex-col w-full gap-2">
            {submitError && (
              <p className="text-destructive text-sm">{submitError}</p>
            )}
            {step !== "basic-information" && (
              <Button
                variant="secondary"
                label="Back"
                onClick={handlePrevious}
              />
            )}
            <div className="w-full">
              <Button
                variant="primary"
                className="w-full"
                disabled={getIsNextDisabled() || isSubmitting}
                loading={isSubmitting}
                type={step === "upload-image" ? "submit" : "button"}
                label={
                  step === "upload-image"
                    ? isSubmitting
                      ? "Submitting..."
                      : "Submit Art Piece"
                    : "Next"
                }
                onClick={
                  step === "upload-image"
                    ? () => handleSubmit()
                    : () => handleNext()
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="hidden md:block w-full md:w-2/3">
        <ArtPiecePreview
          formData={formData}
          artistName={artist?.name ?? null}
          artistProfileImgUrl={
            artist?.profile_img_url
              ? getPublicUrl(artist.profile_img_url)
              : null
          }
        />
      </div>
    </div>
  );
}
