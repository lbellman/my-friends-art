import Input from "@/components/atoms/input/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { StepPropsType } from "@/components/views/SubmitArtPieceView/SubmitArtPieceView";
import { Button } from "@/components/ui/button";
import Step from "@/components/views/SubmitArtPieceView/Step";

export default function OriginalProductDetailsStep({
  formData,
  setFormData,
}: StepPropsType) {
  return (
    <Step
      title="Original Product Details"
      description="Original products are physical items that are sold individually or made to order. If you know the dimensions or size of your item, enter them here. You can always edit this later."
      stepNumber={2}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <label>Dimensions of the original product (inches)</label>

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
          <label>Size</label>
          <Input
            value={formData.price?.toString() || ""}
            onChange={(value) =>
              setFormData({
                ...formData,
                price: value as number,
              })
            }
            placeholder="Size"
            type="number"
          />
        </div>
      </div>
    </Step>
  );
}
