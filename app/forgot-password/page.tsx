"use client";

import { useState } from "react";

import supabase from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InternalLayout from "@/components/organisms/InternalLayout";
import Link from "@/components/atoms/link/Link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const redirectTo =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? `${window.location.origin}/reset-password`
        : "https://myfriendsart.ca/reset-password";

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        { redirectTo },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <InternalLayout title="check your email">
        <div className="flex flex-col gap-6 max-w-md mx-auto text-center">
          <p className="text-muted-foreground body1">
            If an account exists for <strong>{email.trim()}</strong>, you’ll
            receive an email with a link to reset your password.
          </p>
          <p className="text-muted-foreground text-sm">
            Didn’t get an email? Check your spam folder or{" "}
            <Link href="/forgot-password" onClick={() => setSent(false)}>try again</Link>.
          </p>
          <Link href="/artist-login">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </div>
      </InternalLayout>
    );
  }

  return (
    <InternalLayout title="Forgot password">
      <div className="flex flex-col gap-6 max-w-md mx-auto">
        <p className="text-muted-foreground body1 text-center">
          Enter your email and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="forgot-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <p className="text-center">
          <Link href="/artist-login">Back to sign in</Link>
        </p>
      </div>
    </InternalLayout>
  );
}
