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
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FormDataType = {
  title: string;
  description: string;
  medium: MediumType | null;
  product_type: ProductType | null;
  image: File | null;
};

export default function ArtPieceSubmission() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [artistId, setArtistId] = useState<string | null>(null);
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

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from("artist")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (data?.id) setArtistId(data.id);
    })();
  }, [user?.id]);

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    description: "",
    medium: null,
    product_type: null,
    image: null,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!artistId) {
      setSubmitError("Artist account not found. Please log in again.");
      return;
    }
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
      body.append("artistId", artistId);
      body.append("medium", formData.medium);
      if (formData.product_type) {
        body.append("product_type", formData.product_type);
      }
      body.append("image", formData.image);

      const res = await fetch("/api/submit-art-piece", {
        method: "POST",
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

  return (
    <InternalLayout title="submit an art piece">
      {artist?.name && (
        <div className="mx-auto max-w-3xl mb-4 ">
          <p>Submitting as {artist?.name}</p>
        </div>
      )}
      <div className="flex justify-center">
        <div className="bg-card rounded-xl w-full max-w-3xl border p-6 shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Title */}
              <Input
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
                placeholder="Enter the title of your art piece..."
                label="Title"
                id="title"
                required
              />

              {/* Description */}
              <TextArea
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder="Tell us a little more about this art piece..."
                label="Description"
                id="description"
                required
              />

              {/* Medium */}
              <SingleSelect
                value={formData.medium || ""}
                onChange={(value) =>
                  setFormData({ ...formData, medium: value as MediumType })
                }
                options={Object.entries(MEDIUM_OPTIONS).map(([key, value]) => ({
                  key,
                  label: value,
                }))}
                label="Medium"
                id="medium"
                required
              />

              {/*  Product Type */}
              {formData.medium !== "digital" && (
                <SingleSelect
                  label="Product Type"
                  value={formData.product_type || ""}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      product_type: value as ProductType,
                    })
                  }
                  options={Object.entries(PRODUCT_TYPE_OPTIONS).map(
                    ([key, value]) => ({
                      key,
                      label: value,
                    }),
                  )}
                  required
                />
              )}

              {/* Image Upload */}
              <div className="flex flex-col gap-1">
                <label>
                  Image Upload <span className="text-red-500">*</span>
                </label>
                <Dropzone
                  setFile={(file) => setFormData({ ...formData, image: file })}
                />
              </div>

              {submitError && (
                <p className="text-destructive text-sm">{submitError}</p>
              )}

              {/* Submit Button */}
              <div className="flex flex-col gap-2 w-full">
                <Button
                  type="submit"
                  label={isSubmitting ? "Submitting..." : "Submit Art Piece"}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  size="lg"
                />
                <p className="body2 text-muted-foreground">
                  Images may take a minute to process as they go through a few
                  conversion and upload steps. Please don't close this window
                  while the submission is processing.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </InternalLayout>
  );
}
