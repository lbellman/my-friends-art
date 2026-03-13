"use client";

import { ArtistCard } from "@/components/molecules/artist-card/ArtistCard";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { ArtistType } from "@/@types";
import { Button } from "@/components/ui/button";
import Link from "@/components/atoms/link/Link";
import { useEffect } from "react";

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

  // If there is an artist id hash in the url, scroll to that artist card
  useEffect(() => {
    if (window.location.hash) {
      const artistId = window.location.hash.slice(1);
      const artistCard = document.getElementById(artistId);
      if (artistCard) {
        artistCard.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="max-w-5xl flex flex-col w-full gap-12 items-center px-6 py-12">
        <h2 className="font-display">Our Artists</h2>
        <div className="grid grid-cols-1 gap-8 max-w-4xl w-full">
          {loadingArtists
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full rounded-xl" />
              ))
            : artists?.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  linkHref={`/artists/${artist.id}`}
                  linkText="Go to Artist"
                />
              ))}
        </div>
        {/* CTA */}
        <div className="flex flex-col gap-4 items-center">
          <h6>Interested in becoming an artist?</h6>
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
