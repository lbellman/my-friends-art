"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function BecomeAnArtistPage() {
  const [formData, setFormData] = useState({
    name: "",
    email_address: "",
    bio: "",
    location: "",
    website: "",
    instagram: "",
    facebook: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const messageBody = [
        "Artist application",
        "---",
        `Name: ${formData.name.trim()}`,
        `Email: ${formData.email_address.trim()}`,
        `Location: ${formData.location.trim() || "(not provided)"}`,
        "",
        "Social links:",
        `Website: ${formData.website.trim() || "(not provided)"}`,
        `Instagram: ${formData.instagram.trim() || "(not provided)"}`,
        `Facebook: ${formData.facebook.trim() || "(not provided)"}`,
        "",
        "Bio:",
        formData.bio.trim(),
      ].join("\n");

      const templateParams: Record<string, string> = {
        name: formData.name.trim(),
        from_email: formData.email_address.trim(),
        subject: `New Artist Application: ${formData.name.trim()}`,
        message: messageBody,
        to_email: "bellmanlindsey@gmail.com",
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
            template_params: templateParams,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("EmailJS error:", text);
        throw new Error("Failed to send application.");
      }

      toast.success("Application submitted!", {
        description:
          "We'll review your application and get back to you within a few days.",
      });

      setFormData({
        name: "",
        email_address: "",
        bio: "",
        location: "",
        website: "",
        instagram: "",
        facebook: "",
      });
    } catch (err) {
      console.error("Error submitting application:", err);
      toast.error("Failed to submit application", {
        description:
          err instanceof Error
            ? err.message
            : "Please try again or contact us.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background">
      <div className="max-w-3xl w-full flex flex-col gap-8 items-center px-6 py-12">
        <header className="text-center ">
          <h1 className="mb-6">become an artist</h1>
          <p className="">
            Fill out the application below to become an artist.
          </p>
          <p>
            Applications are reviewed by a human, so it may take a few days to
            receive a response.
          </p>
        </header>

        <div className="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 md:p-8">
        <iframe
          src="https://tally.so/embed/KY05X7?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
          width="100%"
          height="1200"
          frameBorder="0"
          title="Artist Submission"
        />
        </div>
      </div>
    </div>
  );
}
