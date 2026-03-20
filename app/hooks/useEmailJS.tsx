export default function useEmailJS() {
  const sendEmail = async ({
    name,
    fromEmail,
    toEmail,
    subject,
    message,
    onSuccess,
    onError,
    setIsSubmitting,
    accessToken,
  }: {
    name: string;
    fromEmail: string;
    toEmail: string;
    subject: string;
    message: string;
    onSuccess: () => void;
    onError: () => void;
    setIsSubmitting: (isSubmitting: boolean) => void;
    accessToken?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const templateParams: Record<string, string> = {
        name,
        from_email: fromEmail,
        subject,
        message,
        to_email: toEmail,
      };

      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
            template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
            user_id: process.env.NEXT_PUBLIC_EMAILJS_USER_ID ?? "",
            accessToken,
            template_params: templateParams,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("EmailJS error:", text);
        onError();
        throw new Error("Failed to send email.");
      }

      onSuccess();
    } catch (error) {
      console.error("Error sending email:", error);
      onError();
      throw new Error("Failed to send email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    sendEmail,
  };
}
