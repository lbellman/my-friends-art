"use client";
import Button from "@/components/atoms/button/Button";
import InternalLayout from "@/components/organisms/InternalLayout";
import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";

export default function ArtistSubmissionSuccess() {
  return (
    <InternalLayout>
      <div className="h-full min-h-screen flex flex-col items-center gap-4">
        <div className="bg-success rounded-full p-4">
          <CheckCircleIcon className="size-10 text-success-foreground" />
        </div>
        <h3>Thank you for your application!</h3>
        <p>We will review your application and get back to you soon.</p>
        <Link href="/">
          <Button label="Back to home" onClick={() => {}} />
        </Link>
      </div>
    </InternalLayout>
  );
}
