import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArtPieceStatusType } from "@/@types";
import DashboardArtCard from "@/components/molecules/dashboard-art-card/DashboardArtCard";
import QueryProvider from "@/components/providers/QueryProvider";

const meta: Meta<typeof DashboardArtCard> = {
  title: "Components/molecules/DashboardArtCard",
  component: DashboardArtCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryProvider>
        <Story />
      </QueryProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  args: {
    artPiece: {
      id: "1",
      title: "Test Piece",
      status: "approved" as ArtPieceStatusType,
      thumbnail_path: "/art-pieces/seaside-meadow.webp",
      display_path: "/art-pieces/seaside-meadow.webp",
      created_at: "2021-01-01",
    },
  },
  argTypes: {
    artPiece: {
      control: "object",
      description: "Art piece data",
    },
  },
} satisfies Meta<typeof DashboardArtCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Approved: Story = {
  args: {
    artPiece: {
      id: "1",
      title: "Seaside Meadow",
      status: "approved" as ArtPieceStatusType,
      thumbnail_path: "/art-pieces/seaside-meadow.webp",
      display_path: "/art-pieces/seaside-meadow.webp",
      created_at: "2021-01-01",
    },
  },
};
export const Pending: Story = {
  args: {
    artPiece: {
      id: "1",
      title: "Seaside Meadow",
      status: "pending-approval" as ArtPieceStatusType,
      thumbnail_path: "/art-pieces/seaside-meadow.webp",
      display_path: "/art-pieces/seaside-meadow.webp",
      created_at: "2021-01-01",
    },
  },
};
export const NotApproved: Story = {
  args: {
    artPiece: {
      id: "1",
      title: "Seaside Meadow",
      status: "not-approved" as ArtPieceStatusType,
      thumbnail_path: "/art-pieces/seaside-meadow.webp",
      display_path: "/art-pieces/seaside-meadow.webp",
      created_at: "2021-01-01",
    },
  },
};
