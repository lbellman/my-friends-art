"use client";

import useAdmin from "@/app/hooks/useAdmin";
import useAuth from "@/app/hooks/useAuth";
import InternalLayout from "@/components/organisms/InternalLayout";
import ArtDetailView from "@/components/views/ArtDetailView";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound, useParams } from "next/navigation";

export default function AdminArtPieceSubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin(user);

  if (!loading && !user) {
    return notFound();
  }
  if (!loading && user && !adminLoading && !isAdmin) {
    return notFound();
  }

  if (loading || (user && adminLoading) || !id) {
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
    />
  );
}
