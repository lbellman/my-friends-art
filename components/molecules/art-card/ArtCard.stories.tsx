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
      original_path: "/art-pieces/seaside-meadow.webp",
      product_type: "print",
      status: "approved",
      artist_id: "1",
      created_at: "2021-01-01",
      px_height: 100,
      category: "wall-art",
      px_width: 100,
      size: null,
      artist: {
        id: "1",
        name: "Test Artist",
        email_address: "test@example.com",
      },
      description: "Test Description",
      authorized_to_sell: true,
      not_ai_generated: false,
      price: 100,
      price_includes_shipping: true,
      product_dimensions_id: "1",
      product_dimensions: { width_in: 10, height_in: 12, depth_in: 0 },
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
      original_path: "/art-pieces/seaside-meadow.webp",
      product_type: "print",
      status: "approved",
      artist_id: "1",
      created_at: "2021-01-01",
      px_height: 100,
      px_width: 100,
      category: "wall-art",
      size: null,
      artist: {
        id: "1",
        name: "Test Artist",
        email_address: "test@example.com",
      },
      description: "Test Description",
      authorized_to_sell: true,
      not_ai_generated: false,
      price: 100,
      price_includes_shipping: true,
      product_dimensions_id: "1",
      product_dimensions: { width_in: 10, height_in: 12, depth_in: 0 },
    },
    href: "/test",
  },
};
