"use client";
import { ArtPiece } from "@/@types";
import supabase from "@/lib/supabase/server";

export default function useArtPiece() {
  const deleteArtPiece = async ({
    onSuccess,
    onError,
    artPieceId,
    thumbnailPath,
    originalPath,
    displayPath,
  }: {
    onSuccess: () => void;
    onError: (error: Error) => void;
    artPieceId: string;
    thumbnailPath: string;
    originalPath: string;
    displayPath: string;
  }) => {
    try {
      const { error } = await supabase
        .from("art_piece")
        .delete()
        .eq("id", artPieceId);
      if (error) {
        onError(error);
        throw error;
      }

      // Cleanup the images from the storage buckets
      // Display path
      if (displayPath) {
        const { error: deleteError } = await supabase.storage
          .from("art-pieces")
          .remove([displayPath]);
        if (deleteError) {
          throw deleteError;
        }
      }

      // Thumbnail path
      if (thumbnailPath) {
        const { error: deleteError } = await supabase.storage
          .from("art-pieces")
          .remove([thumbnailPath]);
        if (deleteError) {
          throw deleteError;
        }
      }

      // Original path
      if (originalPath) {
        const { error: deleteError } = await supabase.storage
          .from("originals")
          .remove([originalPath]);
        if (deleteError) {
          throw deleteError;
        }
      }
    } catch (error) {
      onError(error as Error);
      throw error;
    } finally {
      onSuccess();
    }
  };

  return { deleteArtPiece };
}
