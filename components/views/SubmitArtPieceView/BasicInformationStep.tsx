import TextArea from "@/components/atoms/text-area/TextArea";
import Input from "@/components/atoms/input/Input";
import Step from "@/components/views/SubmitArtPieceView/Step";
import {
  ArtPieceFormDataType,
  StepPropsType,
} from "@/components/views/SubmitArtPieceView/SubmitArtPieceView";
import SingleSelect from "@/components/atoms/single-select/SingleSelect";
import {
  MEDIUM_OPTIONS,
  MediumType,
  PRODUCT_TYPE_OPTIONS,
  ProductType,
} from "@/@types";
import { Button } from "@/components/ui/button";

export default function BasicInformationStep({
  formData,
  setFormData,
  setStep,
}: StepPropsType) {
  const handleNext = () => {
    if (
      formData.product_type === "original"
    ) {
      setStep("original-product-details");
    } else {
      setStep("upload-image");
    }
  };

  const requiresProductType = formData.medium !== "digital";

  return (
    <Step
      title="Basic Information"
      stepNumber={1}
    >
      <div className="flex flex-col gap-6">
        {/* Title */}
        <Input
          value={formData.title}
          onChange={(value) =>
            setFormData({ ...formData, title: value as string })
          }
          placeholder="Enter the title of your art piece..."
          label="Title"
          id="title"
          required
          maxLength={50}
        />

        {/* Description */}
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="Tell us a little more about this art piece..."
          label="Description"
          id="description"
          required
          maxLength={350}
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
                dimensions: value === "print" ? null : formData.dimensions,
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
        {/* Medium */}
        <SingleSelect
          value={formData.medium || ""}
          onChange={(value) =>
            setFormData({ ...formData, medium: value as MediumType })
          }
          options={Object.entries(MEDIUM_OPTIONS)
            .filter(([key]) => key !== "digital")
            .map(([key, value]) => ({
              key,
              label: value,
            }))}
          label="Medium"
          id="medium"
          required
        />
      </div>
    </Step>
  );
}
