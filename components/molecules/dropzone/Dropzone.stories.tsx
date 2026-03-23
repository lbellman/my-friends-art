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
    files: [],
    setFiles: (files: File[] | null) => {
      console.log("files", files);
    },
  },
  argTypes: {
    setFiles: {
      control: "object",
      description: "Function to set the file",
    },
  },
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    files: [],
    setFiles: (files: File[] | null) => {
      console.log("files", files);
    },
  },
};
