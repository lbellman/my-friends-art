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
          <h1 className="mb-6">Become an Artist</h1>
          <p className="">
            Fill out the application below to become an artist.
          </p>
          <p>
            Applications are reviewed by a human, so it may take a few days to
            receive a response.
          </p>
        </header>

        <div className="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm">
                Artist Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="How would you like to be identified on the site?"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email_address" className="text-sm">
                Email Address
              </label>
              <Input
                id="email_address"
                name="email_address"
                type="email"
                value={formData.email_address}
                onChange={handleChange}
                required
                placeholder="Enter your email..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="bio" className="text-sm ">
                Bio
              </label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                placeholder="Give us a short description of who you are and what your art means to you..."
                rows={4}
                className="resize-y min-h-[100px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="location" className="text-sm">
                Location
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, country (optional)"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="website" className="text-sm">
                    Website
                  </label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="instagram" className="text-sm">
                    Instagram
                  </label>
                  <Input
                    id="instagram"
                    name="instagram"
                    type="text"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="@username or URL"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="facebook" className="text-sm">
                    Facebook
                  </label>
                  <Input
                    id="facebook"
                    name="facebook"
                    type="text"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="URL or username"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary-hover h-11 text-base font-medium"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
