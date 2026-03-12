import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import RequestPrintDialog from "@/components/organisms/request-print-dialog/RequestPrintDialog";

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
    printDetails: {
      title: "Windy Cliffside",
      dimensions: "8x10",
      printOption: "canvas",
    },
    dimensionOptions: [
      { width: 8, height: 10 },
      { width: 10, height: 12 },
      { width: 12, height: 16 },
    ],
    loadingDimensionOptions: false,
    emailAddress: "artist@example.com",
  },
} satisfies Meta<typeof RequestPrintDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    printDetails: {
      title: "Windy Cliffside",
      dimensions: "8x10",
      printOption: "canvas",
    },
    dimensionOptions: [
      { width: 8, height: 10 },
      { width: 10, height: 12 },
      { width: 12, height: 16 },
    ],
    loadingDimensionOptions: false,
    emailAddress: "artist@example.com",
  },
};
