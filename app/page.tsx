"use client";
import { ArtPiece } from "@/@types";
import useHighlightedSectionAnchors from "@/app/hooks/useHighlightedSectionAnchors";
import { ArtCard } from "@/components/molecules/ArtCard";
import Subnav from "@/components/organisms/Subnav";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRef } from "react";

const mediumSections = ["digital", "pastel", "acrylic", "watercolor"];

function ArtSection({ title, pieces }: { title: string; pieces: ArtPiece[] }) {
  return (
    <div id={title} className="flex flex-col">
      <h1 className="mb-8 font-display text-3xl tracking-wide text-foreground md:text-4xl">
        {title}
      </h1>
      <ul className="grid grid-cols-3 gap-4 md:gap-8">
        {pieces.map((piece) => (
          <ArtCard
            key={piece.id}
            artPiece={piece as ArtPiece}
            href={`/${piece.id}`}
          />
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const digitalRef = useRef<HTMLButtonElement | null>(null);
  const acrylicRef = useRef<HTMLButtonElement | null>(null);
  const pastelRef = useRef<HTMLButtonElement | null>(null);
  const watercolorRef = useRef<HTMLButtonElement | null>(null);
  const sectionRefs = [digitalRef, acrylicRef, pastelRef, watercolorRef];

  useHighlightedSectionAnchors({
    sections: mediumSections.map((medium, idx) => ({
      id: medium,
      titleRef: sectionRefs[idx],
    })),
    highlightClass: "bg-secondary-hover",
  });

  const { data: artPieces } = useQuery({
    queryKey: ["artPieces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("art_piece")
        .select(
          "id, title, thumbnail_path, display_path, medium, artist:artist_id(id, name)",
        );
      if (error) {
        throw new Error(error.message);
      }
      return data?.map((piece) => ({
        ...piece,
        artist: piece.artist,
      }));
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
        <div className="flex flex-col items-center gap-4 absolute">
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
      <Subnav sectionIds={mediumSections} sectionRefs={sectionRefs} />
      <div className="mx-auto w-full max-w-5xl flex flex-col gap-12 px-4 py-12">
        {/* Digital Pieces */}
        {digitalPieces?.length > 0 && (
          <ArtSection title="digital" pieces={digitalPieces} />
        )}
        {/* Pastel Pieces */}
        {pastelPieces?.length > 0 && (
          <ArtSection title="pastel" pieces={pastelPieces} />
        )}
        {/* Acrylic Pieces */}
        {acrylicPieces?.length > 0 && (
          <ArtSection title="acrylic" pieces={acrylicPieces} />
        )}
        {/* Watercolor Pieces */}
        {watercolorPieces?.length > 0 && (
          <ArtSection title="watercolor" pieces={watercolorPieces} />
        )}
      </div>
    </div>
  );
}
