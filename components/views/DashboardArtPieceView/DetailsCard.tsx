import {
  ART_PIECE_CATEGORY_LABELS,
  ART_PIECE_SIZE_LABELS,
  ArtPiece,
  ArtPieceCategoryType,
  ArtPieceSizeType,
  PRODUCT_TYPE_OPTIONS
} from "@/@types";
import Button from "@/components/atoms/button/Button";
import Input from "@/components/atoms/input/Input";
import SingleSelect from "@/components/atoms/single-select/SingleSelect";
import TextArea from "@/components/atoms/text-area/TextArea";
import supabase from "@/lib/supabase/server";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ProductDimensionsRow = {
  width_in: number | null;
  height_in: number | null;
  depth_in: number | null;
};

type EditFormData = {
  title: string;
  description: string;
  category: ArtPieceCategoryType;
  size: ArtPieceSizeType | null;
  dimensions: ProductDimensionsRow;
};

function formatProductDimensionsDisplay(
  productDimensions: ProductDimensionsRow | null | undefined,
): string {
  // If no product dimensions or they are all null, return "—"
  if (
    !productDimensions ||
    (!productDimensions.width_in &&
      !productDimensions.height_in &&
      !productDimensions.depth_in)
  )
    return "—";
  const formatDimensions = (value: number | null | undefined) =>
    value != null && Number.isFinite(Number(value)) ? `${value}"` : "—";
  return `${formatDimensions(productDimensions.width_in)} × ${formatDimensions(productDimensions.height_in)} × ${formatDimensions(productDimensions.depth_in)}`;
}

const formatDimensions = (value: number | null | undefined) =>
  value != null && Number.isFinite(Number(value)) ? `${value}"` : "—";

function parseInch(value: unknown): number | null {
  if (value === "" || value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const EMPTY_DIMENSIONS: ProductDimensionsRow = {
  width_in: null,
  height_in: null,
  depth_in: null,
};

function getDimensionsFromArtPiece(artPiece: ArtPiece): ProductDimensionsRow {
  const pd = (
    artPiece as {
      product_dimensions?: ProductDimensionsRow | null;
    }
  ).product_dimensions;
  if (!pd) return { ...EMPTY_DIMENSIONS };
  return {
    width_in: pd.width_in ?? null,
    height_in: pd.height_in ?? null,
    depth_in: pd.depth_in ?? null,
  };
}

export default function DetailsCard({ artPiece }: { artPiece: ArtPiece }) {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    title: artPiece.title ?? "",
    description: artPiece.description ?? "",
    category: artPiece.category ?? "wall-art",
    size: artPiece.size ?? null,
    dimensions: getDimensionsFromArtPiece(artPiece),
  });

  useEffect(() => {
    if (isEditing) return;
    setFormData({
      title: artPiece.title ?? "",
      description: artPiece.description ?? "",
      category: artPiece.category ?? "wall-art",
      size: artPiece.size ?? null,
      dimensions: getDimensionsFromArtPiece(artPiece),
    });
  }, [artPiece, isEditing]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }
    if (!formData.category) {
      setError("Category is required");
      return;
    }

    try {
      let newProductDimensionsId: string | undefined;

      if (artPiece.product_type !== "print") {
        const w = parseInch(formData.dimensions.width_in);
        const h = parseInch(formData.dimensions.height_in);
        const d = parseInch(formData.dimensions.depth_in);

        const existingProductDimensionsId =
          (artPiece as { product_dimensions_id?: string | null })
            .product_dimensions_id ?? null;

        // If the art piece already has product dimensions, update the existing one
        if (existingProductDimensionsId) {
          const { error: updateDimensionsError } = await supabase
            .from("product_dimensions")
            .update({
              width_in: w,
              height_in: h,
              depth_in: d,
            })
            .eq("id", existingProductDimensionsId);
          if (updateDimensionsError) {
            setError("Failed to save dimensions");
            return;
          }
        } else {
          // If no existing product dimensions, create a new one
          const { data: inserted, error: insertDimensionsError } =
            await supabase
              .from("product_dimensions")
              .insert({
                art_piece_id: artPiece.id,
                width_in: w,
                height_in: h,
                depth_in: d,
              })
              .select("id")
              .single();
          if (insertDimensionsError || !inserted) {
            setError("Failed to save dimensions");
            return;
          }
          newProductDimensionsId = inserted.id;
        }
      }

      // Update the art piece with new form data
      const { error } = await supabase
        .from("art_piece")
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          size: formData.size,

          // If new product dimensions were created, update the product dimensions id
          ...(newProductDimensionsId
            ? { product_dimensions_id: newProductDimensionsId }
            : {}),
        })
        .eq("id", artPiece.id);

      if (error) {
        setError("Failed to save changes");
        return;
      }

      // Invalidate queries so that new data is fetched
      await queryClient.invalidateQueries({
        queryKey: ["dashboard-art-piece", artPiece.id],
      });

      toast.success("Changes saved successfully");
      setIsEditing(false);
    } catch (error) {
      setError("Failed to save changes");
      return;
    }
  };

  const productTypeLabel = artPiece?.product_type
    ? (PRODUCT_TYPE_OPTIONS[artPiece.product_type] ?? artPiece.product_type)
    : "—";

  const categoryLabel = artPiece?.category
    ? (ART_PIECE_CATEGORY_LABELS[artPiece.category] ?? artPiece.category)
    : "—";

  const sizeLabel =
    artPiece?.size != null
      ? (ART_PIECE_SIZE_LABELS[artPiece.size] ?? artPiece.size)
      : "—";

  const hasDimensions =
    !!artPiece.product_dimensions?.width_in ||
    !!artPiece.product_dimensions?.height_in ||
    !!artPiece.product_dimensions?.depth_in;

  const hasSize = !!artPiece.size;

  const canEdit =
    !isEditing &&
    artPiece.status !== "pending-approval" &&
    artPiece.status !== "sold" &&
    artPiece.status !== "archived";

  return (
    <section className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-base text-foreground">details</h3>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <Button
              label="Edit"
              variant="secondary"
              size="sm"
              dataTestId="Edit"
              onClick={() => setIsEditing(true)}
              icon={<Pencil className="size-4" />}
            />
          ) : null}
        </div>
      </div>
      {/* Details */}
      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm">
        {/* Title */}
        <div>
          {isEditing ? (
            <Input
              value={formData.title}
              onChange={(value) =>
                setFormData({ ...formData, title: value as string })
              }
              placeholder="Title"
              label="Title"
              id="title"
              required
              maxLength={255}
              showCharCount={false}
            />
          ) : (
            <>
              <dt className="text-muted-foreground">Title</dt>
              <dd className="font-medium text-foreground mt-1">
                {artPiece.title ?? "—"}
              </dd>
            </>
          )}
        </div>
        {/* Description */}
        <div className="min-w-0">
          {isEditing ? (
            <TextArea
              value={formData.description}
              onChange={(value) =>
                setFormData({ ...formData, description: value as string })
              }
              placeholder="Description"
              label="Description"
              id="description"
              required
              maxLength={1000}
              showCharCount={false}
            />
          ) : (
            <>
              <dt className="text-muted-foreground">Description</dt>
              <dd className="font-medium text-foreground mt-1 whitespace-pre-wrap wrap-break-word">
                {artPiece.description?.trim() ? artPiece.description : "—"}
              </dd>
            </>
          )}
        </div>
        {/* Category */}
        <div>
          {isEditing ? (
            <SingleSelect
              value={formData.category}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  category: value as ArtPieceCategoryType,
                })
              }
              options={Object.entries(ART_PIECE_CATEGORY_LABELS).map(
                ([key, value]) => ({
                  key,
                  label: value,
                }),
              )}
              placeholder="Select a category"
              label="Category"
              id="category"
              required
            />
          ) : (
            <>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium text-foreground mt-1">
                {categoryLabel}
              </dd>
            </>
          )}
        </div>
        {/* Product type */}
        <div>
          <>
            <dt className="text-muted-foreground">Product type</dt>
            <dd className="font-medium text-foreground mt-1">
              {productTypeLabel}
            </dd>
          </>
        </div>
        {artPiece.product_type !== "print" && (
          <>
            {/* Size */}
            <div>
              {isEditing ? (
                <SingleSelect
                  value={formData.size ?? ""}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      size: value
                        ? (value as ArtPieceSizeType)
                        : null,
                    })
                  }
                  options={Object.entries(ART_PIECE_SIZE_LABELS).map(
                    ([key, value]) => ({
                      key,
                      label: value,
                    }),
                  )}
                  placeholder="Select a size"
                  label="Size"
                  id="size"
                  allowDeselect
                />
              ) : hasSize ? (
                <>
                  <dt className="text-muted-foreground">Size</dt>
                  <dd className="font-medium text-foreground mt-1">
                    {sizeLabel}
                  </dd>
                </>
              ) : null}
            </div>
            {/* Dimensions */}
            <div>
              {isEditing ? (
                <div className="flex flex-col flex-nowrap gap-4">
                  <Input
                    value={formData.dimensions.width_in ?? ""}
                    type="number"
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          width_in:
                            value === "" || value === undefined
                              ? null
                              : Number(value),
                        },
                      })
                    }
                    placeholder="Enter a number..."
                    label="Width (inches)"
                    id="width-in"
                  />
                  <Input
                    value={formData.dimensions.height_in ?? ""}
                    type="number"
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          height_in:
                            value === "" || value === undefined
                              ? null
                              : Number(value),
                        },
                      })
                    }
                    placeholder="Enter a number..."
                    label="Height (inches)"
                    id="height-in"
                  />
                  <Input
                    value={formData.dimensions.depth_in ?? ""}
                    type="number"
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          depth_in:
                            value === "" || value === undefined
                              ? null
                              : Number(value),
                        },
                      })
                    }
                    placeholder="Enter a number..."
                    label="Depth (inches)"
                    id="depth-in"
                  />
                </div>
              ) : hasDimensions ? (
                <>
                  <dt className="text-muted-foreground">Dimensions (inches)</dt>
                  <dd className="flex flex-col gap-1 text-foreground mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Width:</span>
                      <span className="font-medium">
                        {formatDimensions(
                          artPiece.product_dimensions?.width_in,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Height:</span>
                      <span className="font-medium">
                        {formatDimensions(
                          artPiece.product_dimensions?.height_in,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Depth:</span>
                      <span className="font-medium">
                        {formatDimensions(
                          artPiece.product_dimensions?.depth_in,
                        )}
                      </span>
                    </div>
                  </dd>
                </>
              ) : null}
            </div>
          </>
        )}

        {/* Save/Cancel buttons */}
        {isEditing ? (
          <div className="flex items-center justify-end gap-2">
            {error && <p className="text-destructive body2">{error}</p>}
            <Button
              label="Cancel"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(false)}
            />
            <Button
              label="Save"
              variant="primary"
              size="sm"
              onClick={() => {
                void handleSave();
              }}
            />
          </div>
        ) : null}
      </dl>
    </section>
  );
}
