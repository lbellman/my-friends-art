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
      name: "Lindsey Bellman",
      email_address: "lindsey@bellman.com",
      profile_img_url: "/headshot.webp",
      location: "Victoria, BC",
      user_id: "1",
      bio: "I’m Lindsey, an artist based in British Columbia. I have always felt a connection with painting and drawing, and I try to work in as many mediums as possible. I don't really have a consistent style because I am always trying new things and experimenting with different mediums. I live in a beautiful place by the ocean so I get a lot of inspiration from Vancouver Island nature. I also have very vivid and colourful dreams, so from time to time I will attempt to paint one. I love having the freedom to create whatever comes into my mind. Thank you for being here and sharing in this passion.",
      created_at: "2021-01-01",
      updated_at: "2021-01-01",
      facebook: "https://facebook.com/lindsey",
      instagram: "@linds",
      website: "https://lindsey.com",
      status: "approved",
    },
  },
} satisfies Meta<typeof ArtistCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    artist: {
      id: "1",
      name: "Lindsey Bellman",
      email_address: "lindsey@bellman.com",
      profile_img_url: "/headshot.webp",
      user_id: "1",
      location: "Victoria, BC",
      instagram: "@linds",
      website: "https://lindsey.com",
      facebook: "https://facebook.com/lindsey",
      bio: "I’m Lindsey, an artist based in British Columbia. I have always felt a connection with painting and drawing, and I try to work in as many mediums as possible. I don't really have a consistent style because I am always trying new things and experimenting with different mediums. I live in a beautiful place by the ocean so I get a lot of inspiration from Vancouver Island nature. I also have very vivid and colourful dreams, so from time to time I will attempt to paint one. I love having the freedom to create whatever comes into my mind. Thank you for being here and sharing in this passion.",
      created_at: "2021-01-01",
      status: "approved",
      updated_at: "2021-01-01",
    },
  },
};
