"use client";
import Link from "@/components/atoms/link/Link";
import InternalLayout from "@/components/organisms/InternalLayout";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, Globe, Mail, MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ArtCard } from "@/components/molecules/art-card/ArtCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArtistType, ArtPiece } from "@/@types";
import { lowerCase } from "lodash";
import { ArtistCard } from "@/components/molecules/artist-card/ArtistCard";

export default function ArtistDetailPage() {
  const { artistId } = useParams<{ artistId: string }>();

  const { data: artist, isLoading: isLoadingArtist } =
    useQuery<ArtistType | null>({
      queryKey: ["artist", artistId],
      queryFn: async () => {
        if (!artistId) return null;
        const { data, error } = await supabase
          .from("artist")
          .select("*")
          .eq("id", artistId as string)
          .single();
        if (error) throw new Error(error.message);
        return data as ArtistType;
      },
    });

  const { data: artPieces, isLoading: isLoadingArtPieces } = useQuery<
    ArtPiece[]
  >({
    queryKey: ["artist-art-pieces", artistId],
    queryFn: async () => {
      if (!artistId) return [];
      const { data, error } = await supabase
        .from("art_piece")
        .select("*, artist ( id, name )")
        .eq("artist_id", artistId as string);

      if (error) throw new Error(error.message);
      return (data ?? []) as ArtPiece[];
    },
  });

  return (
    <InternalLayout
      title={
        artist?.name ? lowerCase(`About ${artist.name}`) : "about the artist"
      }
      back={{
        href: "/artists",
        label: "Back to all artists",
      }}
    >
      <div className="mx-auto items-center flex w-full max-w-5xl flex-col gap-10">
        {/* <Link href="/artists" ariaLabel="Back to all artists">
          <div className="flex items-center gap-2 ">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to all artists
          </div>
        </Link> */}

        {/* Artist profile */}
        {isLoadingArtist ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : artist ? (
          <section className="">
            {/* Image */}
            <ArtistCard artist={artist} />
          </section>
        ) : (
          <p className="text-muted-foreground">Artist not found.</p>
        )}

        {/* Artist's art pieces */}
        <section className="flex flex-col gap-4 mt-8 w-full">
          <h4 className="font-display tracking-wide mb-4 text-foreground">
            Art by {artist?.name ?? "this artist"}
          </h4>

          {isLoadingArtPieces ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-[320px] w-full rounded-xl" />
              ))}
            </div>
          ) : !artPieces || artPieces.length === 0 ? (
            <p className="text-muted-foreground">
              This artist doesn&apos;t have any pieces published yet.
            </p>
          ) : (
            <ul className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3">
              {artPieces.map((piece) => (
                <ArtCard
                  key={piece.id}
                  artPiece={piece}
                  href={`/artists/${artistId}/${piece.id}`}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </InternalLayout>
  );
}
