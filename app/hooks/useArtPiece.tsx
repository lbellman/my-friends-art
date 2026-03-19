"use client";
import supabase from "@/lib/supabase/server";

export default function useArtPiece({ id }: { id: string }) {
  const deleteArtPiece = async ({onSuccess, onError}:{

    onSuccess: () => void,
    onError: (error: Error) => void,
  }
  ) => {
    try {
      const { error } = await supabase.from("art_piece").delete().eq("id", id);
      if (error) {
        onError(error);
        throw error;
      }

      // Delete the image objects from the storage buckets
      const { error: deleteError } = await supabase.storage
        .from("art-pieces")
        .remove([id]);
      const { error: deleteOriginalError } = await supabase.storage
        .from("originals")
        .remove([id]);
      if (deleteError) {
        throw deleteError;
      }
      if (deleteOriginalError) {
        throw deleteOriginalError;
      }
    } catch (error) {
      onError(error as Error);
      throw error;
    } finally {
      // onSuccess();
    }
  };

  return { deleteArtPiece };
}
