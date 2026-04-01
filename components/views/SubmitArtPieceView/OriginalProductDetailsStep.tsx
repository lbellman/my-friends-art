import Input from "@/components/atoms/input/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { StepPropsType } from "@/components/views/SubmitArtPieceView/SubmitArtPieceView";
import { Button } from "@/components/ui/button";
import Step from "@/components/views/SubmitArtPieceView/Step";
import SingleSelect from "@/components/atoms/single-select/SingleSelect";
import { ART_PIECE_SIZE_LABELS, ArtPieceSizeType } from "@/@types";

export default function OriginalProductDetailsStep({
  formData,
  setFormData,
}: StepPropsType) {
  return (
    <Step
      title="Product Details"
      description="If you know the dimensions or size of your item, enter them here. If your product is made to order, you can skip this step. You can always edit this later."
      stepNumber={2}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <label className="body2">Dimensions of the original product (inches)</label>

          <div className="grid grid-cols-1 mt-2 gap-2">
            <Input
              value={formData.dimensions?.width_in?.toString() || ""}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  dimensions: {
                    ...formData.dimensions,
                    width_in: value as number,
                  },
                })
              }
              placeholder="Width (inches)"
              type="number"
            />
            <Input
              value={formData.dimensions?.height_in?.toString() || ""}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  dimensions: {
                    ...formData.dimensions,
                    height_in: value as number,
                  },
                })
              }
              placeholder="Height (inches)"
              type="number"
            />
            <Input
              value={formData.dimensions?.depth_in?.toString() || ""}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  dimensions: {
                    ...formData.dimensions,
                    depth_in: value as number,
                  },
                })
              }
              placeholder="Depth (inches)"
              type="number"
            />
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-2">
          <SingleSelect
            value={formData.size || ""}
            onChange={(value) =>
              setFormData({
                ...formData,
                size: value as ArtPieceSizeType,
              })
            }
            options={Object.entries(ART_PIECE_SIZE_LABELS).map(
              ([key, value]) => ({
                key,
                label: value,
              }),
            )}
            label="Size"
            id="size"
            placeholder="Select a size"
          />
        </div>
      </div>
    </Step>
  );
}
