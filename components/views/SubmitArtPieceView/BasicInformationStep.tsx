import { ArtPieceCategoryType, ART_PIECE_CATEGORY_LABELS, PRODUCT_TYPE_OPTIONS, ProductType } from "@/@types";
import Input from "@/components/atoms/input/Input";
import SingleSelect from "@/components/atoms/single-select/SingleSelect";
import TextArea from "@/components/atoms/text-area/TextArea";
import Step from "@/components/views/SubmitArtPieceView/Step";
import { StepPropsType } from "@/components/views/SubmitArtPieceView/SubmitArtPieceView";

export default function BasicInformationStep({
  formData,
  setFormData,
  setStep,
}: StepPropsType) {
  const handleNext = () => {
    if (formData.product_type === "original") {
      setStep("original-product-details");
    } else {
      setStep("upload-image");
    }
  };

  return (
    <Step title="Basic Information" stepNumber={1}>
      <div className="flex flex-col gap-6">
        {/* Title */}
        <Input
          value={formData.title}
          onChange={(value) =>
            setFormData({ ...formData, title: value as string })
          }
          placeholder="Enter the title of your art piece..."
          label="Title"
          dataTestId="title"
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
          dataTestId="description"
          id="description"
          required
          maxLength={350}
        />
        {/*  Product Type */}
        <SingleSelect
          dataTestId="product-type"
          label="Product Type"
          value={formData.product_type || ""}
          onChange={(value) =>
            setFormData({
              ...formData,
              product_type: value as ProductType,
              dimensions: value === "print" ? null : formData.dimensions,
              size: value === "print" ? null : formData.size,
              category: null
            })
          }
          options={Object.entries(PRODUCT_TYPE_OPTIONS)
            .filter(([key]) => key !== "print-and-original")
            .map(([key, value]) => ({
              key,
              label: value,
            }))}
          required
        />
        {/* Category */}
        <SingleSelect
          dataTestId="category"
          label="Category"
          value={formData.category || ""}
          onChange={(value) => setFormData({ ...formData, category: value as ArtPieceCategoryType })}
          options={Object.entries(ART_PIECE_CATEGORY_LABELS).map(([key, value]) => ({
            key,
            label: value,
          }))}
          required
        />
      </div>
    </Step>
  );
}
