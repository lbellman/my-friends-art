import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ArtPiece } from "@/@types";
import RequestPrintDialog from "@/components/organisms/request-print-dialog/RequestPrintDialog";

const mockArtPiece = {
  id: "piece-1",
  title: "Windy Cliffside",
  artist_id: "artist-1",
  medium: "digital",
  aspect_ratio: "3:4",
  authorized_to_sell: true,
  not_ai_generated: true,
  px_width: 3600,
  px_height: 4800,
  artist: {
    id: "artist-1",
    name: "Test Artist",
    email_address: "artist@example.com",
  },
} as unknown as ArtPiece;

const meta: Meta<typeof RequestPrintDialog> = {
  title: "Components/organisms/RequestPrintDialog",
  component: RequestPrintDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    open: true,
    onOpenChange: () => {},
    printOption: "canvas",
    emailAddress: "artist@example.com",
    artPiece: mockArtPiece,
    pxWidth: 3600,
    pxHeight: 4800,
  },
} satisfies Meta<typeof RequestPrintDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    printOption: "canvas",
    emailAddress: "artist@example.com",
    artPiece: mockArtPiece,
    pxWidth: 3600,
    pxHeight: 4800,
  },
};

export const MissingPixels: Story = {
  args: {
    ...Default.args,
    pxWidth: null,
    pxHeight: null,
  },
};
