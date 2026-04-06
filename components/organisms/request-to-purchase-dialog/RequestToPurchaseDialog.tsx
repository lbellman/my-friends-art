import { ArtPiece, CHAR_LIMITS } from "@/@types";
import useCreateProductRequest from "@/app/hooks/useCreateProductRequest";
import Input from "@/components/atoms/input/Input";
import TextArea from "@/components/atoms/text-area/TextArea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface RequestToPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artPiece: ArtPiece;
  isCustomOrder?: boolean;
  emailAddress: string;
}

type FormDataType = {
  name: string;
  email: string;
  message: string;
};
export default function RequestToPurchaseDialog({
  open,
  onOpenChange,
  artPiece,
  isCustomOrder = false,
  emailAddress,
}: RequestToPurchaseDialogProps) {
  const { createProductRequest } = useCreateProductRequest();
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createProductRequest({
        artPiece,
        artistEmailAddress: emailAddress,
        type: isCustomOrder ? "custom-order" : "original",
        params: {
          name: formData.name,
          message: formData.message,
          from_email: formData.email,
          art_piece_id: artPiece.id,
          artist_id: artPiece?.artist?.id,
        },
      });

      if (result.ok) {
        setFormData({
          name: "",
          email: "",
          message: "",
        });
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCustomOrder ? "request a custom order" : "request to purchase"}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to request{" "}
            {isCustomOrder ? "a custom order of" : "to purchase"} &quot;
            {artPiece?.title}&quot;. The artist will get back to you with
            details about your order.
          </DialogDescription>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 mt-2">
              <Input
                id="name"
                label="Name"
                value={formData.name}
                onChange={(value) =>
                  setFormData({ ...formData, name: value as string })
                }
                required
                placeholder="Enter your name..."
              />

              <Input
                id="email"
                label="Email"
                value={formData.email}
                onChange={(value) =>
                  setFormData({ ...formData, email: value as string })
                }
                required
                placeholder="Enter your email..."
              />

              <TextArea
                id="message"
                label="Message"
                value={formData.message}
                onChange={(value) =>
                  setFormData({ ...formData, message: value as string })
                }
                required
                placeholder="Any special requests or questions about the product?"
                maxLength={CHAR_LIMITS.product_request_message}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
