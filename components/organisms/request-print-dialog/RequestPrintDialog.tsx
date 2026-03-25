import { ArtPiece, CHAR_LIMITS, PRINT_OPTION_LABELS, PrintOptionType } from "@/@types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import TextArea from "@/components/atoms/text-area/TextArea";
import { useState } from "react";
import { toast } from "sonner";
import _ from "lodash";
import useSendEmail from "@/app/hooks/useSendEmail";
import supabase from "@/lib/supabase/server";

export default function RequestPrintDialog({
  open,
  onOpenChange,
  printDetails,
  dimensionOptions,
  loadingDimensionOptions,
  emailAddress,
  artPiece,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printDetails: {
    dimensions: string;
    printOption: PrintOptionType;
  };
  artPiece: ArtPiece;
  dimensionOptions: {
    width: number;
    height: number;
  }[];
  loadingDimensionOptions?: boolean;
  emailAddress: string;
}) {
  const { sendEmail } = useSendEmail();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    dimensions: printDetails?.dimensions || "",
    printOption: printDetails?.printOption || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const printRequestMessage = `${formData.name} has requested a print of ${artPiece?.title || "Art Piece"} with the following details: \n\n Dimensions: ${printDetails?.dimensions || ""} \n\nPrint Option: ${printDetails?.printOption || ""}\n\n${formData.message ? "Message: " + formData.message : ""} \n\n Please contact them at ${formData.email} to discuss pricing and shipping details. Thanks! `;

    // Create a new product request in the database
    const { data: productRequest, error } = await supabase
      .from("product_request")
      .insert({
        art_piece_id: artPiece.id,
        artist_id: artPiece.artist.id,
        type: "print",
        dimensions: printDetails?.dimensions || formData.dimensions,
        from_email: formData.email,
        message: formData.message || null,
        name: formData.name,
        print_option: printDetails?.printOption as PrintOptionType,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to create print request", {
        description:
          "Please try again or contact bellmanlindsey@gmail.com for support.",
      });
      setIsSubmitting(false);
    } else {
      const artistOk = await sendEmail({
        name: formData.name,
        fromEmail: formData.email,
        toEmail: emailAddress,
        subject: `My Friend's Art - Print Request`,
        message: printRequestMessage,
        onSuccess: () => {},
        onError: async () => {
          toast.error("Failed to send request", {
            description: "Please try again or contact me directly via email.",
          });

          await supabase
            .from("product_request")
            .update({
              status: "email-failed",
            })
            .eq("id", productRequest?.id);
        },
        setIsSubmitting,
      });

      if (!artistOk) return;

      await sendEmail({
        name: "My Friend's Art",
        fromEmail: "bellmanlindsey@gmail.com",
        toEmail: formData.email,
        subject: `My Friend's Art - Print Request Confirmation`,
        message: `Thank you for your print request for ${artPiece?.title}. The artist will contact you directly with pricing and shipping details.`,
        onSuccess: () => {},
        onError: () => {},
        setIsSubmitting,
      });

      toast.success("Print request created!", {
        description:
          "The artist will get back to you soon about pricing and shipping. Thank you!",
      });
      setFormData({
        name: "",
        email: "",
        message: "",
        dimensions: printDetails?.dimensions || "",
        printOption: printDetails?.printOption || "",
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>request a print</DialogTitle>
          <DialogDescription>
            Fill out the form below to request a print of &quot;
            {artPiece?.title}&quot;. The artist will get back to you with
            pricing and shipping details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
            />
          </div>
          {/* Dimension Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Dimensions
            </label>
            {loadingDimensionOptions ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-9 w-20" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {dimensionOptions.map((dim) => {
                  const dimensionValue = `${dim.width}x${dim.height}`;
                  const isSelected = formData.dimensions === dimensionValue;
                  return (
                    <Button
                      key={dimensionValue}
                      type="button" // stops it from submitting the form everytime you click it (buttons in <form> elements are default type="submit")
                      variant={isSelected ? "default" : "outline"}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          dimensions: dimensionValue,
                        })
                      }
                    >
                      {dimensionValue}&quot;
                    </Button>
                  );
                })}
                <Button
                  variant={
                    formData.dimensions === "custom" ? "default" : "outline"
                  }
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, dimensions: "custom" })
                  }
                >
                  Custom
                </Button>
              </div>
            )}
          </div>

          {/* Print Option Selection */}
          <div className="space-y-3 ">
            <label className="text-sm font-medium text-foreground">
              Print Type
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.keys(PRINT_OPTION_LABELS).map((option) => {
                const isSelected = formData.printOption === option;
                return (
                  <Button
                    key={option}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        printOption: option as PrintOptionType,
                      })
                    }
                    className={
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : ""
                    }
                  >
                    {PRINT_OPTION_LABELS[option as PrintOptionType]}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="text-sm font-medium text-foreground"
            >
              Message (Optional)
            </label>
            <TextArea
              id="message"
              label="Message"
              value={formData.message}
              onChange={(value) => setFormData({ ...formData, message: value })}
              placeholder="Any specific requests or questions about the print?"
              maxLength={CHAR_LIMITS.product_request_message}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
