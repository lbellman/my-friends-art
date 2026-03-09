import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Link from "@/components/atoms/link/Link";

const meta: Meta<typeof Link> = {
  title: "Components/atoms/Link",
  component: Link,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    href: "/",
    children: "Link",
  },
  argTypes: {
    href: {
      control: "text",
      description: "The URL to which the link should navigate.",
    },
    children: {
      control: "text",
      description: "The content of the link.",
    },
    disabled: {
      control: "boolean",
      description: "Whether the link is disabled.",
    },
    inline: {
      control: "boolean",
      description:
        "Whether the link is displayed in a block of text. This changes the color to make it stand out as an interactive element.",
    },
    ariaLabel: {
      control: "text",
      description: "Link aria label",
    },
    blankTarget: {
      control: "boolean",
      description: "Whether the link should open in a new tab.",
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: "/",
    children: "This is a link!",
    disabled: false,
    inline: false,
    blankTarget: false,
    ariaLabel: "Link aria label",
  },
};
