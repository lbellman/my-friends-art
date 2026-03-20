import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  ArtPieceStatusType,
  PrintOptionType,
  ProductRequestRow,
} from "@/@types";
import ProductRequestCard from "@/components/molecules/product-request-card/ProductRequestCard";
import QueryProvider from "@/components/providers/QueryProvider";

const defaultArgs = {
  id: "1",
  art_piece_id: "1",
  artist_id: "1",
  created_at: "2021-01-01",
  dimensions: "10x10",
  from_email: "winston@winston.com",
  message: "I love this! Can you make me a print of it?",
  name: "Winston Fiskman",
  print_option: "print" as PrintOptionType,
  status: "pending",
  type: "print",
} as ProductRequestRow;

const meta: Meta<typeof ProductRequestCard> = {
  title: "Components/molecules/ProductRequestCard",
  component: ProductRequestCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    request: defaultArgs,
  },
  argTypes: {
    request: {
      control: "object",
      description: "Product request data",
    },
  },
} satisfies Meta<typeof ProductRequestCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    request: defaultArgs,
  },
};
