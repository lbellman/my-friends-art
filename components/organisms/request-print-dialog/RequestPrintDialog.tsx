"use client";

import {
  ArtPiece,
  CHAR_LIMITS,
  PRINT_OPTION_LABELS,
  PrintOptionType,
} from "@/@types";
import TextArea from "@/components/atoms/text-area/TextArea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import DimensionsSingleSelect, {
  resolveDimensionSelectValue,
} from "@/components/molecules/dimensions-single-select/DimensionsSingleSelect";
import supabase from "@/lib/supabase/server";
import useSendEmail from "@/app/hooks/useSendEmail";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Input from "@/components/atoms/input/Input";

export default function RequestPrintDialog({
  open,
  onOpenChange,
  printOption,
  emailAddress,
  artPiece,
  pxWidth,
  pxHeight,
  dimensions: dimensionsProp,
  onDimensionsChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printOption?: PrintOptionType;
  artPiece: ArtPiece;
  emailAddress: string;
  pxWidth?: number | null;
  pxHeight?: number | null;
  /** When set with `onDimensionsChange`, dimensions are controlled by the parent (e.g. ArtDetailView). */
  dimensions?: string;
  onDimensionsChange?: (key: string) => void;
}) {
  const { sendEmail } = useSendEmail();
  const isDimensionsControlled =
    dimensionsProp !== undefined && onDimensionsChange !== undefined;

  const [internalDimensions, setInternalDimensions] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    printOption: printOption || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dimensionsValue = isDimensionsControlled
    ? dimensionsProp!
    : internalDimensions;
  const setDimensionsValue = isDimensionsControlled
    ? onDimensionsChange!
    : setInternalDimensions;

  const dimensionSelectValue = useMemo(
    () =>
      resolveDimensionSelectValue(dimensionsValue, pxWidth, pxHeight),
    [dimensionsValue, pxWidth, pxHeight],
  );

  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current && !isDimensionsControlled) {
      setInternalDimensions(
        resolveDimensionSelectValue("", pxWidth, pxHeight),
      );
      setFormData((prev) => ({
        ...prev,
        printOption: printOption || "canvas",
      }));
    }
    if (open && !prevOpen.current && isDimensionsControlled) {
      setFormData((prev) => ({
        ...prev,
        printOption: printOption || "canvas",
      }));
    }
    prevOpen.current = open;
  }, [
    open,
    isDimensionsControlled,
    printOption,
    pxWidth,
    pxHeight,
  ]);

  const handleChange = (name: string, value: string | number) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dimsForMessage = dimensionSelectValue;
    const printOptForMessage = formData.printOption || printOption || "";

    const printRequestMessage = `${formData.name} has requested a print of ${artPiece?.title || "Art Piece"} with the following details: \n\n Dimensions: ${dimsForMessage} \n\nPrint Option: ${printOptForMessage}\n\n${formData.message ? "Message: " + formData.message : ""} \n\n Please contact them at ${formData.email} to discuss pricing and shipping details. Thanks! `;

    const { data: productRequest, error } = await supabase
      .from("product_request")
      .insert({
        art_piece_id: artPiece.id,
        artist_id: artPiece.artist.id,
        type: "print",
        dimensions: dimsForMessage,
        from_email: formData.email,
        message: formData.message || null,
        name: formData.name,
        print_option: formData.printOption as PrintOptionType,
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
        printOption: printOption || "",
      });
      if (!isDimensionsControlled) {
        setInternalDimensions("");
      }
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
            <Input
              id="name"
              type="text"
              label="Name"
              value={formData.name}
              onChange={(value) => handleChange("name", value)}
              required
              placeholder="Your name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Input
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleChange("email", value)}
              required
              placeholder="your.email@example.com"
            />
          </div>
          <DimensionsSingleSelect
            id="print-dimensions"
            value={dimensionsValue}
            onChange={setDimensionsValue}
            pxWidth={pxWidth}
            pxHeight={pxHeight}
            label="Dimensions"
            required
            placeholder="Select a print size"
          />

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
            <TextArea
              id="message"
              label="Message (optional)"
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
