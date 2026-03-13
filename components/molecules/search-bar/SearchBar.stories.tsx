import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SearchBar from "@/components/molecules/search-bar/SearchBar";

const meta: Meta<typeof SearchBar> = {
  title: "Components/molecules/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    onSearch: (query: string) => {
      console.log("[SearchBar] onSearch", query);
    },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
