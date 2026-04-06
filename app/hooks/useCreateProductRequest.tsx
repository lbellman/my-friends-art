import { ArtPiece, PrintOptionType } from "@/@types";
import useSendEmail from "@/app/hooks/useSendEmail";
import supabase from "@/lib/supabase/server";
import { toast } from "sonner";

type ProductRequestParams = {
  name: string;
  message: string;
  from_email: string;
  art_piece_id: string;
  artist_id: string;

  // For type "print"
  dimensions?: string;
  print_option?: PrintOptionType;
};

export type ProductRequestResult =
  | { ok: true }
  | {
      ok: false;
      reason: "db" | "artist_email" | "confirmation_email";
    };

function toastProductRequestOutcome(
  type: "print" | "original" | "custom-order",
  result: ProductRequestResult,
) {
  if (result.ok) {
    if (type === "print") {
      toast.success("Print request created!", {
        description:
          "The artist will get back to you soon about pricing and shipping. Thank you!",
      });
    } else {
      toast.success("Purchase request created!", {
        description:
          "The artist will get back to you with details about your order. Thank you!",
      });
    }
    return;
  }
  if (result.reason === "db") {
    toast.error("Could not save your request", {
      description: "Please try again in a moment.",
    });
    return;
  }
  if (result.reason === "artist_email") {
    toast.error("Failed to send request", {
      description:
        "Please try again or contact bellmanlindsey@gmail.com for support.",
    });
    return;
  }
  toast.error("Failed to send confirmation email", {
    description:
      "Your request was saved, but we could not email you a confirmation.",
  });
}

export default function useCreateProductRequest() {
  const { sendEmail } = useSendEmail();
  const createProductRequest = async ({
    type,
    params,
    artistEmailAddress,
    artPiece,
  }: {
    type: "print" | "original" | "custom-order";
    params: ProductRequestParams;
    artistEmailAddress: string;
    artPiece: ArtPiece;
  }): Promise<ProductRequestResult> => {
    const {
      name,
      message,
      from_email,
      art_piece_id,
      artist_id,
      dimensions,
      print_option,
    } = params;
    try {
      // Insert a product request in the database
      const productRequestId = await insertProductRequest({
        type,
        params: {
          name,
          message,
          from_email,
          art_piece_id,
          artist_id,
          dimensions: type === "print" && dimensions ? dimensions : undefined,
          print_option:
            type === "print" && print_option ? print_option : undefined,
        },
      });

      // If no errors, send emails to the artist and the customer
      const result = await sendEmails({
        type,
        params: {
          name,
          message,
          from_email,
          art_piece_id,
          artist_id,
          dimensions,
          print_option,
        },
        productRequestId,
        artPiece,
        artistEmailAddress,
      });

      // Display a toast message based on the result
      toastProductRequestOutcome(type, result);
      return result;
    } catch (error) {
      console.error(error);
      const failed: ProductRequestResult = { ok: false, reason: "db" };
      toastProductRequestOutcome(type, failed);
      return failed;
    }
  };

  const insertProductRequest = async ({
    type,
    params,
  }: {
    type: "print" | "original" | "custom-order";
    params: ProductRequestParams;
  }) => {
    const productRequestId = crypto.randomUUID();

    const defaultParams = {
      id: productRequestId,
      type,
      art_piece_id: params.art_piece_id,
      artist_id: params.artist_id,
      from_email: params.from_email,
      message: params.message || null,
      name: params.name,
      status: "pending" as const,
    };

    const { error: insertError } = await supabase
      .from("product_request")
      .insert({
        ...defaultParams,
        dimensions:
          type === "print" && params.dimensions ? params.dimensions : undefined,
        print_option:
          type === "print" && params.print_option
            ? params.print_option
            : undefined,
      });
    if (insertError) {
      throw new Error("Failed to create product request");
    }
    return productRequestId;
  };

  const sendEmails = async ({
    type,
    params,
    productRequestId,
    artPiece,
    artistEmailAddress,
  }: {
    type: "print" | "original" | "custom-order";
    params: ProductRequestParams;
    productRequestId: string;
    artPiece: ArtPiece;
    artistEmailAddress: string;
  }): Promise<ProductRequestResult> => {
    let body = "";

    // Put together the body of the email based on the type of request
    if (type === "print") {
      body = [
        `${params.name} has requested a print of ${artPiece?.title || "Art Piece"} with the following details:`,
        `Preferred Dimensions (inches): ${params.dimensions}`,
        `Preferred Print Option: ${params.print_option}`,
        params.message ? `Message: ${params.message}` : null,
        `Please contact them at ${params.from_email} to discuss pricing and shipping details. Thank you!`,
      ]
        .filter(Boolean)
        .join("\n");
    } else {
      body = [
        `${params.name} has requested ${type === "original" ? "to purchase" : "a custom order of"} ${artPiece?.title || "Art Piece"}.`,
        params.message ? `Message: ${params.message}` : null,
        `Please contact them at ${params.from_email} to discuss pricing and shipping details. Thank you!`,
      ]
        .filter(Boolean)
        .join("\n");
    }

    const requestLabel =
      type === "print"
        ? "Print Request"
        : type === "original"
          ? "Purchase Request"
          : "Custom Order Request";

    // Send email to the artist
    const artistEmailOk = await sendEmail({
      name: params.name,
      fromEmail: params.from_email,
      toEmail: artistEmailAddress,
      subject: `${requestLabel} for ${artPiece?.title || "Art Piece"}`,
      message: body,
    });

    // If artist email fails, update the status of the request to "email-failed"
    if (!artistEmailOk) {
      await supabase
        .from("product_request")
        .update({ status: "email-failed" })
        .eq("id", productRequestId);
      return { ok: false, reason: "artist_email" };
    }

    // Send email to the customer
    const confirmationOk = await sendEmail({
      toEmail: params.from_email,
      subject: `${requestLabel} Confirmation`,
      message: `The artist has been notified of your request for ${artPiece?.title || "Art Piece"}. They will contact you directly with more details. Thank you!`,
    });

    if (!confirmationOk) {
      return { ok: false, reason: "confirmation_email" };
    }

    return { ok: true };
  };

  return {
    createProductRequest,
  };
}
