"use client";

import useAuth from "@/app/hooks/useAuth";
import SubmitArtPieceView from "@/components/views/SubmitArtPieceView/SubmitArtPieceView";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ArtPieceSubmission() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user && !loading) {
      redirect("/");
    }
  }, [user, loading]);

  return <SubmitArtPieceView />;
}
