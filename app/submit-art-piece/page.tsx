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
      const body = new FormData();
      body.append("title", formData.title.trim());
      body.append("description", formData.description.trim());
      body.append("medium", formData.medium);
      if (formData.product_type) {
        body.append("product_type", formData.product_type);
      }
      body.append("not_ai_generated", formData.not_ai_generated.toString());
      body.append("authorized_to_sell", formData.authorized_to_sell.toString());
      if (formData.price) {
        body.append("price", formData.price.toString());
        body.append(
          "price_includes_shipping",
          formData.price_includes_shipping ? "true" : "false",
        );
      }

      if (formData.dimensions) {
        body.append("dimensions", JSON.stringify(formData.dimensions));
      }
      body.append("image", formData.image);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setSubmitError("You must be signed in to submit art.");
        return;
      }

      const res = await fetch("/api/submit-art-piece", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
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
