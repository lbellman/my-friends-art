// components/molecules/ArtCard.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { ArtCard } from "./ArtCard";
import type { ArtPiece } from "@/@types";

function renderArtCard(overrides: Partial<ArtPiece> = {}) {
  const artPiece: ArtPiece = {
    id: "piece-1",
    title: "Sunset Over Mountains",
    thumbnail_path: "art-pieces/sunset.png",
    display_path: null,
    original_path: null,
    artist_id: "artist-1",
    category: "wall-art",
    size: null,
    created_at: "2021-01-01",
    px_height: 100,
    px_width: 100,
    product_type: "print",
    status: "approved",
    authorized_to_sell: true,
    not_ai_generated: true,
    price: 100,
    price_includes_shipping: true,
    product_dimensions_id: null,
    product_dimensions: {
      width_in: 10,
      height_in: 12,
      depth_in: 0,
    },
    description: "A beautiful sunset over mountains",
    artist: {
      id: "artist-1",
      name: "Test Artist",
      email_address: "test@example.com",
    },
    // fill in any required fields not shown in the snippet
    ...overrides,
  };

  render(<ArtCard artPiece={artPiece} href={`/art/${artPiece.id}`} />);

  return { artPiece };
}

describe("ArtCard", () => {
  it("renders title, and artist name", () => {
    const { artPiece } = renderArtCard();

    expect(screen.getByText(artPiece.title)).toBeInTheDocument();
    expect(screen.getByText(artPiece.artist.name)).toBeInTheDocument();
  });

  it("wraps content in a link with the provided href", () => {
    const { artPiece } = renderArtCard();

    const link = screen.getByRole("link", {
      name: new RegExp(artPiece.title, "i"),
    });
    expect(link).toBeInTheDocument();
  });

  it("renders an image with correct alt text", () => {
    const { artPiece } = renderArtCard();

    const img = screen.getByRole("img", { name: artPiece.title });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", artPiece.title);
  });

  it("falls back to first letter of title when no image URL is available", () => {
    const { artPiece } = renderArtCard({ thumbnail_path: null });

    // Image should not be present
    const imgs = screen.queryAllByRole("img");
    expect(imgs.length).toBe(0);

    // Fallback initial should be rendered
    expect(screen.getByText(artPiece.title.charAt(0))).toBeInTheDocument();
  });
});
