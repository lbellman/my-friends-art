import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArtPieceStatusType } from "@/@types";
import DashboardArtCard from "@/components/molecules/dashboard-art-card/DashboardArtCard";
import QueryProvider from "@/components/providers/QueryProvider";
import { Dropzone } from "@/components/molecules/dropzone/Dropzone";

const meta: Meta<typeof Dropzone> = {
  title: "Components/molecules/Dropzone",
  component: Dropzone,
  tags: ["autodocs"],

  parameters: {
    layout: "centered",
  },
  args: {
    setFile: (file: File | null) => {
      console.log("file", file);
    },
  },
  argTypes: {
    setFile: {
      control: "object",
      description: "Function to set the file",
    },
  },
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    setFile: (file: File | null) => {
      console.log("file", file);
    },
  },
};
