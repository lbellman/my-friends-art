"use client";
import { ArtCard } from "@/components/molecules/ArtCard";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase/server";
import { Tables } from "@/supabase";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import Image from "next/image";

export type ArtPiece = Tables<"art_piece">;

function ArtSection({ title, pieces }: { title: string; pieces: ArtPiece[] }) {
  return (
    <div id={title} className="flex flex-col">
      <h1 className="mb-8 font-display text-3xl tracking-wide text-foreground md:text-4xl">
        {title}
      </h1>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {pieces.map((piece) => (
          <ArtCard key={piece.id} artPiece={piece as ArtPiece} />
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const { data: artPieces } = useQuery({
    queryKey: ["artPieces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("art_piece")
        .select("id, title, img_url, medium");
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  // Split the art pieces into mediums
  const digitalPieces = artPieces?.filter(
    (piece) => piece.medium === "digital",
  ) as ArtPiece[];
  const acrylicPieces = artPieces?.filter(
    (piece) => piece.medium === "acrylic",
  ) as ArtPiece[];
  const pastelPieces = artPieces?.filter(
    (piece) => piece.medium === "pastel",
  ) as ArtPiece[];
  const watercolorPieces = artPieces?.filter(
    (piece) => piece.medium === "watercolor",
  ) as ArtPiece[];

  return (
    <div className="relative flex flex-col">
      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-center justify-center w-full overflow-hidden">
        <Image
          src="/art-pieces/seaside-meadow.webp"
          alt="Windy cliffside"
          fill
          className="object-cover opacity-0 animate-fade-in object-[50%_50%]"
          priority
          sizes="100vw"
          loading="eager"
        />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="flex flex-col items-center gap-2 absolute">
          <h1
            className=" font-display opacity-0 animate-fade-up text-white text-center tracking-wide"
            style={{ animationDelay: "200ms" }}
          >
            My Friend&apos;s Art
          </h1>
          <h3
            className=" opacity-0 animate-fade-up font-display text-center text-white tracking-wide"
            style={{ animationDelay: "400ms" }}
          >
            Meaningful art made by someone&apos;s friend.
          </h3>
        </div>
      </div>
      {/*  Subnav */}
      <div className="sticky top-16 z-10 left-0 p-4 bg-secondary backdrop-blur-lg">
        <div className="flex flex-row gap-4 items-center justify-center mx-auto max-w-5xl">
          {["digital", "acrylic", "pastel", "watercolor"].map((medium) => (
            <Button
              variant="secondary"
              key={medium}
              onClick={() => {
                // Scroll to the section
                const section = document.getElementById(medium);
                if (section) {
                  section.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
            >
              {_.startCase(medium)}
            </Button>
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-5xl flex flex-col gap-12 px-4 py-12">
        {/* Digital Pieces */}
        {digitalPieces?.length > 0 && (
          <ArtSection title="digital" pieces={digitalPieces} />
        )}
        {/* Acrylic Pieces */}
        {acrylicPieces?.length > 0 && (
          <ArtSection title="acrylic" pieces={acrylicPieces} />
        )}
        {/* Pastel Pieces */}
        {pastelPieces?.length > 0 && (
          <ArtSection title="pastel" pieces={pastelPieces} />
        )}
        {/* Watercolor Pieces */}
        {watercolorPieces?.length > 0 && (
          <ArtSection title="watercolor" pieces={watercolorPieces} />
        )}
      </div>
    </div>
  );
}
