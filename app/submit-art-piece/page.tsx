"use client";
import {
  MEDIUM_OPTIONS,
  MediumType,
  PRODUCT_TYPE_OPTIONS,
  ProductType,
} from "@/@types";
import useAuth from "@/app/hooks/useAuth";
import Button from "@/components/atoms/button/Button";
import Input from "@/components/atoms/input/Input";
import SingleSelect from "@/components/atoms/single-select/SingleSelect";
import TextArea from "@/components/atoms/text-area/TextArea";
import { Dropzone } from "@/components/molecules/dropzone/Dropzone";
import InternalLayout from "@/components/organisms/InternalLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import SubmitArtPieceView from "@/components/views/SubmitArtPieceView/SubmitArtPieceView";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FormDataType = {
  title: string;
  description: string;
  medium: MediumType | null;
  product_type: ProductType | null;
  not_ai_generated: boolean;
  authorized_to_sell: boolean;
  image: File | null;

  // For physical art pieces
  price?: number | null;
  price_includes_shipping?: boolean;
  dimensions?: {
    width_in?: number;
    height_in?: number;
    depth_in?: number;
  } | null;
};

type UploadInitResponse = {
  // Private bucket name used for temporary uploads only.
  bucket: string;
  // Server-scoped object key to upload into.
  stagingPath: string;
  // Short-lived signed token that authorizes exactly one upload.
  uploadToken: string;
};

export default function ArtPieceSubmission() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: artist, isLoading: isLoadingArtist } = useQuery({
    queryKey: ["artist", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("artist")
        .select("id, name")
        .eq("user_id", user?.id || "")
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user && !loading) {
      redirect("/");
    }
  }, [user, loading]);

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    description: "",
    medium: null,
    product_type: null,
    not_ai_generated: false,
    price: null,
    price_includes_shipping: false,
    authorized_to_sell: false,
    image: null,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.title.trim()) {
      setSubmitError("Title is required.");
      return;
    }
    if (!formData.medium) {
      setSubmitError("Medium is required.");
      return;
    }
    const needsProductType = formData.medium !== "digital";
    if (needsProductType && !formData.product_type) {
      setSubmitError("Product type is required for this medium.");
      return;
    }
    if (!formData.image) {
      setSubmitError("Please upload an image.");
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

      // Step 1: Upload our image to a private supabase staging bucket
      // This prevents large images being sent through a request body (which has content limits)
      // Call the upload-url endpoint to get a staging path and a one-time signed upload token
      const uploadInitRes = await fetch("/api/submit-art-piece/upload-url", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const uploadInitData = (await uploadInitRes
        .json()
        .catch(() => ({}))) as Partial<UploadInitResponse> & {
        error?: string;
      };

      if (!uploadInitRes.ok) {
        setSubmitError(
          uploadInitData.error ?? "Failed to initialize image upload.",
        );
        return;
      }

      if (
        !uploadInitData.bucket ||
        !uploadInitData.stagingPath ||
        !uploadInitData.uploadToken
      ) {
        setSubmitError("Invalid upload session. Please try again.");
        return;
      }

      // Step 2: Upload the raw image directly to staging bucket via the signed upload token and staging path
      const stagingUpload = await supabase.storage
        .from(uploadInitData.bucket)
        .uploadToSignedUrl(
          uploadInitData.stagingPath,
          uploadInitData.uploadToken,
          formData.image,
        );

      if (stagingUpload.error) {
        setSubmitError("Image upload failed. Please try again.");
        return;
      }

      // Step 3: Call the submit-art-piece endpoint and pass in the staging path
      // This validates ownership, uploads the original image to the originals bucket, uploads converted display and thumbnails images, and creates a database record
      const res = await fetch("/api/submit-art-piece", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          medium: formData.medium,
          stagingPath: uploadInitData.stagingPath,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 413) {
          setSubmitError(
            "Submission payload is too large. Please retry with a smaller image.",
          );
          return;
        }
        setSubmitError(data.error ?? "Submission failed. Please try again.");
        return;
      }
      router.push("/submit-art-piece/success");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <SubmitArtPieceView />;
}
