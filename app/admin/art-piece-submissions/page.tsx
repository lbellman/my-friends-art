"use client";
import { ArtPiece } from "@/@types";
import useAuth from "@/app/hooks/useAuth";
import ArtPieceSubmissionsView from "@/components/organisms/ArtPieceSubmissionsView";
import InternalLayout from "@/components/organisms/InternalLayout";
import supabase from "@/lib/supabase/server";
import Button from "@/components/atoms/button/Button";
import SearchBar from "@/components/molecules/search-bar/SearchBar";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function isAdminUser(user: {
  user_metadata?: Record<string, unknown> | null;
}): boolean {
  const metadata = user.user_metadata ?? {};
  const role =
    typeof metadata.role === "string" ? metadata.role.toLowerCase() : "";
  return role === "admin";
}

export default function AdminArtPieceSubmissionsPage() {
  const { user, loading } = useAuth();
  const isAdmin = isAdminUser({ user_metadata: user?.user_metadata });

  if (!loading && (!user || !isAdmin)) {
    return notFound();
  }

  type StatusFilter = "all" | "pending-approval" | "approved";
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: artPieces, error } = useQuery({
    queryKey: ["artPieces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("art_piece")
        .select("*, artist (id, name, email_address)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ArtPiece[];
    },
    enabled: !!user && isAdmin,
  });

  console.log(artPieces);

  const filteredArtPieces = useMemo(() => {
    const items = artPieces ?? [];
    const statusFiltered =
      statusFilter === "all"
        ? items
        : items.filter((p) => p.status === statusFilter);

    const q = searchTerm.trim().toLowerCase();
    if (!q) return statusFiltered;

    return statusFiltered.filter((p) =>
      (p.title ?? "").toLowerCase().includes(q),
    );
  }, [artPieces, statusFilter, searchTerm]);

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-7 max-w-3xl mx-auto mb-4 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold">Art Piece Submissions</h1>
        <p className="mt-2 text-sm text-destructive-foreground">
          Failed to load art piece submissions.
        </p>
      </div>
    );
  }

  return (
    <InternalLayout title="art piece submissions">
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          type="button"
          size="sm"
          variant={statusFilter === "all" ? "primary" : "secondary"}
          label="All"
          onClick={() => setStatusFilter("all")}
        />
        <Button
          type="button"
          size="sm"
          variant={
            statusFilter === "pending-approval" ? "primary" : "secondary"
          }
          label="Pending"
          onClick={() => setStatusFilter("pending-approval")}
        />
        <Button
          type="button"
          size="sm"
          variant={statusFilter === "approved" ? "primary" : "secondary"}
          label="Approved"
          onClick={() => setStatusFilter("approved")}
        />

        <SearchBar
          onSearch={(q) => {
            setSearchTerm(q);
          }}
          placeholder="Search by art title..."
        />

        {searchTerm.trim() ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            label="Clear search"
            onClick={() => setSearchTerm("")}
          />
        ) : null}
      </div>

      <ArtPieceSubmissionsView artPieces={filteredArtPieces as ArtPiece[]} />
    </InternalLayout>
  );
}
