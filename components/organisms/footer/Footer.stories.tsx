import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Footer from "@/components/organisms/footer/Footer";

const meta: Meta<typeof Footer> = {
  title: "Components/organisms/Footer",
  component: Footer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {},
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
