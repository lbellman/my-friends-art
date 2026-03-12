import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArtistCard } from "@/components/molecules/artist-card/ArtistCard";

const meta: Meta<typeof ArtistCard> = {
  title: "Components/molecules/ArtistCard",
  component: ArtistCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    artist: {
      id: "1",
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
    },
  },
} satisfies Meta<typeof ArtistCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    artist: {
      id: "1",
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
    },
  },
};
