"use client";

import useAuth from "@/app/hooks/useAuth";
import InternalLayout from "@/components/organisms/InternalLayout";
import ArtDetailView from "@/components/views/ArtDetailView";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound, useParams } from "next/navigation";

function isAdminUser(user: {
  user_metadata?: Record<string, unknown> | null;
}): boolean {
  const metadata = user.user_metadata ?? {};
  const role =
    typeof metadata.role === "string" ? metadata.role.toLowerCase() : "";
  return role === "admin";
}

export default function AdminArtPieceSubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { user, loading } = useAuth();
  const isAdmin = isAdminUser({ user_metadata: user?.user_metadata });

  if (!loading && (!user || !isAdmin)) {
    return notFound();
  }

  if (loading || !id) {
    return (
      <InternalLayout title="art piece submission" contentSize="lg">
        <Skeleton className="w-full min-h-[400px] rounded-lg" />
      </InternalLayout>
    );
  }

  return (
    <ArtDetailView
      artPieceIdentifier={id}
      back={{
        href: "/admin/art-piece-submissions",
        label: "Back to submissions",
      }}
      previewMode={true}
    />
  );
}
