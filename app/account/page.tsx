"use client";

import useAuth from "@/app/hooks/useAuth";
import Button from "@/components/atoms/button/Button";
import Input from "@/components/atoms/input/Input";
import InternalLayout from "@/components/organisms/InternalLayout";
import supabase from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Input as InputPrimitive } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function getUserDisplayName(
  user: { user_metadata?: Record<string, unknown> } | null,
): string {
  if (!user?.user_metadata) return "";
  const name =
    (user.user_metadata.full_name as string) ??
    (user.user_metadata.name as string) ??
    "";
  return typeof name === "string" ? name : "";
}

function parseName(name: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  if (!name?.trim()) return { firstName: "", lastName: "" };
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default function AccountPage() {
  const { user, loading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      redirect("/");
    }
  }, [user, loading]);

  useEffect(() => {
    const displayName = getUserDisplayName(user);
    const { firstName: f, lastName: l } = parseName(displayName);
    setFirstName(f);
    setLastName(l);
  }, [user]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setNameSuccess(false);
    const fullName = [firstName.trim(), lastName.trim()]
      .filter(Boolean)
      .join(" ");
    if (!fullName) {
      setNameError("Name is required.");
      return;
    }
    setIsSavingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (error) throw error;
      setNameSuccess(true);
    } catch (err) {
      console.error(err);
      setNameError("Failed to update name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setPasswordError("Failed to update password. Please try again.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <InternalLayout title="account">
      <div className="flex justify-center">
        {loading ? (
          <Skeleton className="w-full max-w-2xl h-[500px]" />
        ) : (
          <div className="bg-card rounded-xl w-full max-w-2xl border p-6 shadow-md space-y-8">
            {/* Email (read-only) */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email address
              </label>
              <p className="mt-1 text-foreground">{user?.email ?? "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This is your login email. To change it, please contact support.
              </p>
            </div>

            {/* Name (editable) — user's name from auth */}
            <form onSubmit={handleSaveName} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First name"
                  id="first-name"
                  value={firstName}
                  onChange={(value) => setFirstName(value as string)}
                  placeholder="First name"
                />
                <Input
                  label="Last name"
                  id="last-name"
                  value={lastName}
                  onChange={(value) => setLastName(value as string)}
                  placeholder="Last name"
                />
              </div>
              {nameError && (
                <p className="text-destructive text-sm">{nameError}</p>
              )}
              {nameSuccess && (
                <p className="text-green-600 text-sm">Name updated.</p>
              )}
              <Button
                type="submit"
                label={isSavingName ? "Saving…" : "Save name"}
                disabled={isSavingName}
              />
            </form>

            {/* Change password */}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <p className="body1 font-semibold">Change password</p>
              <div className="flex flex-col gap-2">
                <label htmlFor="new-password">New password</label>
                <InputPrimitive
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="confirm-password">Confirm new password</label>
                <InputPrimitive
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              {passwordError && (
                <p className="text-destructive text-sm">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-green-600 text-sm">Password updated.</p>
              )}
              <Button
                type="submit"
                label={isSavingPassword ? "Updating…" : "Update password"}
                disabled={isSavingPassword}
              />
            </form>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
