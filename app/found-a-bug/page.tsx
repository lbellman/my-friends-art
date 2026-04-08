"use client";

import useSendEmail from "@/app/hooks/useSendEmail";
import Button from "@/components/atoms/button/Button";
import Input from "@/components/atoms/input/Input";
import TextArea from "@/components/atoms/text-area/TextArea";
import InternalLayout from "@/components/organisms/InternalLayout";
import { useState } from "react";
import { toast } from "sonner";

const BUG_REPORT_TO_EMAIL = "bellmanlindsey@gmail.com";

export default function FoundABugPage() {
  const { sendEmail } = useSendEmail();
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) {
      toast.error("Please describe what happened.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please provide a title for this report.");
      return;
    }

    const messageBody = [
      title.trim() ? `Title: ${title.trim()}` : "Title: (not provided)",
      "",
      "Description:",
      trimmed,
    ].join("\n");

    await sendEmail({
      name: "",
      fromEmail: email.trim(),
      toEmail: BUG_REPORT_TO_EMAIL,
      subject: `[Bug report] ${title.trim() ? title.trim() : "Anonymous"}`,
      message: messageBody,
      onSuccess: () => {
        toast.success("Thanks for your help!", {
          description: "I'll get this fixed as soon as possible.",
        });
        setTitle("");
        setEmail("");
        setDescription("");
      },
      onError: () => {
        toast.error("Could not send report", {
          description:
            "Please try again or email me directly at bellmanlindsey@gmail.com.",
        });
      },
      setIsSubmitting,
    });
  };

  return (
    <InternalLayout title="found a bug">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <p className="text-muted-foreground text-center body1">
          This app is still in development and being built by a single
          developer. Bugs are inevitable, and I appreciate your help in finding
          them!
        </p>
        <p className="text-muted-foreground text-center body1">
          Please fill out the form below to report the bug. Describe it in as
          much detail as possible.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8"
        >
          <Input
            id="bug-title"
            label="Title"
            required
            value={title}
            onChange={(v) => setTitle(v as string)}
            placeholder="Short summary of the bug..."
            maxLength={200}
            showCharCount={false}
          />
          <TextArea
            id="bug-description"
            label="What happened?"
            value={description}
            onChange={(v) => setDescription(v as string)}
            required
            placeholder="Steps to reproduce, what you expected, what you saw instead…"
            maxLength={20000}
            showCharCount={false}
          />
          <Input
            id="bug-email"
            label="Email (optional)"
            type="email"
            value={email}
            onChange={(v) => setEmail(v as string)}
            placeholder="Your email if you'd like me to follow up..."
          />
          <Button
            type="submit"
            label={isSubmitting ? "Sending…" : "Send report"}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </form>
      </div>
    </InternalLayout>
  );
}
