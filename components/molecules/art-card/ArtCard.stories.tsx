import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArtCard } from "@/components/molecules/art-card/ArtCard";

const meta: Meta<typeof ArtCard> = {
  title: "Components/molecules/ArtCard",
  component: ArtCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    artPiece: {
      id: "1",
      title: "Test Piece",
      thumbnail_path: null,
      display_path: "/art-pieces/seaside-meadow.webp",
      medium: "digital",
      artist_id: "1",
      aspect_ratio: "3:4",
      created_at: "2021-01-01",
      dpi: 100,
      px_height: 100,
      px_width: 100,
      artist: {
        id: "1",
        name: "Test Artist",
        email_address: "test@example.com",
      },
      description: "Test Description",
    },
    href: "/test",
  },
} satisfies Meta<typeof ArtCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    artPiece: {
      id: "1",
      title: "Test Piece",
      thumbnail_path: null,
      display_path: "/art-pieces/seaside-meadow.webp",
      medium: "digital",
      artist_id: "1",
      aspect_ratio: "3:4",
      created_at: "2021-01-01",
      dpi: 100,
      px_height: 100,
      px_width: 100,
      artist: {
        id: "1",
        name: "Test Artist",
        email_address: "test@example.com",
      },
      description: "Test Description",
    },
    href: "/test",
  },
};
