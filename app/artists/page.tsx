"use client";

import { ArtistCard } from "@/components/molecules/ArtistCard";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { ArtistType } from "@/@types";
import { Button } from "@/components/ui/button";
import Link from "@/components/atoms/Link";

export default function ArtistsPage() {
  const { data: artists, isLoading: loadingArtists } = useQuery({
    queryKey: ["artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artist")
        .select(
          "id, name, bio, profile_img_url, location, email_address, facebook, website, instagram",
        );
      if (error) {
        throw new Error(error.message);
      }
      return data as ArtistType[];
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="max-w-5xl flex flex-col w-full gap-12 items-center px-6 py-12">
        <h2 className="font-display text-5xl">Our Artists</h2>
        <div className="grid grid-cols-1 gap-8 max-w-4xl w-full">
          {loadingArtists
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full rounded-xl" />
              ))
            : artists?.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
        </div>
        {/* CTA */}
        <div className="flex flex-col gap-4 items-center">
          <h3>Interested in becoming an artist?</h3>
          <Button size="lg">
            <Link href="/become-an-artist" asChild>
              Become an Artist
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
