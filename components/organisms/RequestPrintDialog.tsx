import { PRINT_OPTION_LABELS, PrintOptionType } from "@/@types";
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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import _ from "lodash";

export default function SpecialRequestDialog({
  open,
  onOpenChange,
  printDetails,
  dimensionOptions,
  loadingDimensionOptions,
  emailAddress,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printDetails: {
    title: string;
    dimensions: string;
    printOption: PrintOptionType;
  };
  dimensionOptions: {
    width: number;
    height: number;
  }[];
  loadingDimensionOptions: boolean;
  emailAddress: string;
}) {
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

    try {
      const subject = `My Friend's Art - Print Request`;
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
            template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
            user_id: process.env.NEXT_PUBLIC_EMAILJS_USER_ID ?? "",
            template_params: {
              name: formData.name,
              from_email: formData.email,
              subject: subject,
              message: `${formData.name} has requested a print of ${printDetails?.title || "Art Piece"} with the following details: \n\n Dimensions: ${printDetails?.dimensions || ""} \n\nPrint Option: ${printDetails?.printOption || ""}\n\n${formData.message ? "Message: " + formData.message : ""} \n\n Please contact them at ${formData.email} to discuss pricing and shipping details. Thanks! `,
              to_email: emailAddress,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast.success("Print request sent!", {
        description:
          "The artist will get back to you soon about pricing and shipping. Thank you!",
      });

      // Reset form and close dialog
      setFormData({
        name: "",
        email: "",
        message: "",
        dimensions: printDetails?.dimensions || "",
        printOption: printDetails?.printOption || "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send request", {
        description: "Please try again or contact me directly via email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request a Print</DialogTitle>
          <DialogDescription>
            Fill out the form below to request a print of &quot;
            {printDetails?.title}&quot;. The artist will get back to you with pricing
            and shipping details.
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
          {dimensionOptions.length > 0 && (
            <div className=" space-y-3">
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
                        type="button"
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
                </div>
              )}
            </div>
          )}

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
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any specific requests or questions about the print?"
              rows={4}
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
