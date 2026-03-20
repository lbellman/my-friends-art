"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/atoms/link/Link";
import supabase from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InternalLayout from "@/components/organisms/InternalLayout";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        const isRecovery =
          session.user?.recovery_sent_at != null ||
          (typeof window !== "undefined" &&
            window.location.hash?.includes("type=recovery"));
        if (isRecovery || session.user) {
          setSessionReady(true);
          return;
        }
      }

      if (typeof window !== "undefined" && window.location.hash) {
        setSessionReady(true);
        return;
      }

      setInvalidLink(true);
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // End recovery session so the user isn’t “logged in” until they sign in with the new password.
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        // eslint-disable-next-line no-console
        console.error(signOutError);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/artist-login?reset=success");
      }, 1500);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (invalidLink) {
    return (
      <InternalLayout title="invalid or expired link">
        <div className="flex flex-col gap-6 max-w-md mx-auto text-center">
          <p className="text-muted-foreground body1">
            This reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full">Request new link</Button>
          </Link>
          <Link href="/artist-login">Back to sign in</Link>
        </div>
      </InternalLayout>
    );
  }

  if (success) {
    return (
      <InternalLayout title="password updated">
        <div className="flex flex-col gap-6 max-w-md mx-auto text-center">
          <p className="text-muted-foreground body1">
            Your password has been updated. Redirecting you to sign in…
          </p>
        </div>
      </InternalLayout>
    );
  }

  if (!sessionReady) {
    return (
      <InternalLayout title="reset password">
        <div className="max-w-md mx-auto text-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </InternalLayout>
    );
  }

  return (
    <InternalLayout title="set new password">
      <div className="flex flex-col gap-6 max-w-md mx-auto">
        <p className="text-muted-foreground body1 text-center">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="new-password" className="text-sm font-medium">
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm new password
            </label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>

        <p className="text-center">
          <Link href="/artist-login">Back to sign in</Link>
        </p>
      </div>
    </InternalLayout>
  );
}
