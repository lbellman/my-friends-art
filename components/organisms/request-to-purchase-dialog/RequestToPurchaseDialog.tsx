import { ArtPiece, CHAR_LIMITS } from "@/@types";
import { Button } from "@/components/ui/button";
import Input from "@/components/atoms/input/Input";
import TextArea from "@/components/atoms/text-area/TextArea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import useSendEmail from "@/app/hooks/useSendEmail";
import { toast } from "sonner";

interface RequestToPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artPiece: ArtPiece;
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
}: RequestToPurchaseDialogProps) {
  const { sendEmail } = useSendEmail();
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestMessage = [
    "Request to Purchase",
    "---",
    `${formData.name} has requested to purchase ${artPiece?.title}.`,
    `Email: ${formData.email}`,
    `Message: ${formData.message}`,
    "---",
    "Please respond at your earliest convenience. Thank you!",
  ].join("\n");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendEmail({
      name: formData.name,
      fromEmail: formData.email,
      toEmail: artPiece?.artist?.email_address || "",
      subject: `Request to Purchase - ${artPiece?.title}`,
      message: requestMessage,
      onSuccess: () => {
        toast.success("Email sent successfully", {
          description: "The artist will get back to you soon!",
        });
      },
      onError: () => {
        toast.error("Failed to send email");
      },
      setIsSubmitting,
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>request to purchase</DialogTitle>
          <DialogDescription>
            Fill out the form below to request to purchase &quot;
            {artPiece?.title}&quot;. The artist will get back to you with
            pricing and shipping details.
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
              <Button type="submit">
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
