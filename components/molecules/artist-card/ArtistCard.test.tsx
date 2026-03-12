// components/molecules/ArtCard.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { ArtistCard } from "./ArtistCard";
import { ArtistType } from "@/@types";


function renderArtistCard(overrides: Partial<ArtistType> = {}) {
  const artist: ArtistType = {
    id: "artist-1",
    name: "Test Artist",
    email_address: "test@example.com",
    profile_img_url: "/profile.jpg",
    location: "Victoria, BC",
    facebook: "Artist's Facebook",
    website: "Artist's Website",
    instagram: "Artist's Instagram",
    bio: "This is a test bio.",
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
    ...overrides,
  }
  render(<ArtistCard artist={artist} />);

  return { artist };
}

describe("ArtCard", () => {
  it("renders name, bio, profile image", () => {
    const { artist } = renderArtistCard();

    expect(
      screen.getByRole("heading", { name: artist.name }),
    ).toBeInTheDocument();

    expect(screen.getByText(artist.bio as string)).toBeInTheDocument();
  });

  it("renders a profile image with correct alt text", () => {
    const { artist } = renderArtistCard();

    const img = screen.getByRole("img", { name: artist.name })
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", artist.name);
  });

  it("falls back to first letter of artist name when no image URL is available", () => {
    const { artist } = renderArtistCard({ profile_img_url: null });

    // Image should not be present
    const imgs = screen.queryAllByRole("img");
    expect(imgs.length).toBe(0);

    // Fallback initial should be rendered
    expect(screen.getByText(artist.name.charAt(0))).toBeInTheDocument();
  });  
});
