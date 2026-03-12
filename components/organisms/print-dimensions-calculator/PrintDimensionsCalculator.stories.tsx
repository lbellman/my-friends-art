import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PrintDimensionsCalculator } from "@/components/organisms/print-dimensions-calculator/PrintDimensionsCalculator";

const meta: Meta<typeof PrintDimensionsCalculator> = {
  title: "Components/organisms/PrintDimensionsCalculator",
  component: PrintDimensionsCalculator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof PrintDimensionsCalculator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
