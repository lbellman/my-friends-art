export type SendEmailArgs = {
  name?: string;
  fromEmail?: string;
  toEmail: string;
  subject: string;
  message: string;
  onSuccess?: () => void;
  onError?: () => void;
  /** When omitted, submitting state is not toggled (e.g. batch flows in `useProductRequest`). */
  setIsSubmitting?: (isSubmitting: boolean) => void;
};

/**
 * Sends mail through the server-side Resend integration (`POST /api/send-email`).
 * Do not put API keys in the client; they stay in `RESEND_API_KEY`.
 * @returns whether the message was accepted by the API
 */
export default function useSendEmail() {
  const sendEmail = async ({
    name,
    fromEmail,
    toEmail,
    subject,
    message,
    onSuccess,
    onError,
    setIsSubmitting,
  }: SendEmailArgs): Promise<boolean> => {
    setIsSubmitting?.(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          fromEmail,
          toEmail,
          subject,
          message,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        console.error("send-email API:", data.error ?? response.statusText);
        onError?.();
        return false;
      }

      onSuccess?.();
      return true;
    } catch (error) {
      console.error("send-email fetch:", error);
      onError?.();
      return false;
    } finally {
      setIsSubmitting?.(false);
    }
  };

  return { sendEmail };
}
