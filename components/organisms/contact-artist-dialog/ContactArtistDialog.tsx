import { ArtistType, ArtPiece, CHAR_LIMITS } from "@/@types";
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

interface ContactArtistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: ArtistType;
}

type FormDataType = {
  name: string;
  email: string;
  message: string;
};
export default function ContactArtistDialog({
  open,
  onOpenChange,
  artist,
}: ContactArtistDialogProps) {
  const { sendEmail } = useSendEmail();
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendEmail({
      name: formData.name,
      fromEmail: formData.email,
      toEmail: artist?.email_address || "",
      subject: `Contact from ${formData.name}`,
      message: formData.message,
      onSuccess: () => {
        toast.success("Email sent successfully", {
          description: "The artist will get back to you soon!",
        });
        onOpenChange(false);
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
          <DialogTitle>contact {artist?.name.toLowerCase()}</DialogTitle>
          <DialogDescription>
            Contact {artist?.name} if you have a commission request, want to
            collaborate, or just meet and have a conversation!
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
                placeholder="Introduce yourself and explain why you're reaching out..."
                maxLength={CHAR_LIMITS.product_request_message}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
