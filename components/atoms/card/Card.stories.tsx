import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/atoms/button/Button";
import Card from "@/components/atoms/card/Card";
import { CheckCircle2 } from "lucide-react";

const meta: Meta<typeof Card> = {
  title: "Components/atoms/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Card Title",
    description: "Card Description",
    children: (
      <div className="flex flex-col gap-2">
        <p>
          This is some content inside the card. This can be a paragraph, a list,
          a table, or any other content!
        </p>
      </div>
    ),

    footerContent: (
      <div className="flex items-center gap-2">
        <Button label="Back to Home" variant="secondary" onClick={() => null} />
      </div>
    ),
  },
  argTypes: {
    title: {
      control: "text",
      description: "Card title",
    },
    description: {
      control: "text",
      description: "Card description",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Card Title",
    description: "Card Description",
    children: (
      <div className="flex flex-col gap-2">
        <p>
          This is some content inside the card. This can be a paragraph, a list,
          a table, or any other content!
        </p>
      </div>
    ),
  },
};
export const Centered: Story = {
  args: {
    title: "Card Title",
    justify: "centered",
    description: "Card Description",
    children: (
      <div className="flex flex-col gap-2">
        <p>
          This is some content inside the card. This can be a paragraph, a list,
          a table, or any other content!
        </p>
      </div>
    ),
  },
};
export const IconLeft: Story = {
  args: {
    title: "Card Title",
    icon: (
      <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
        <CheckCircle2 className="size-6 text-success-foreground" />
      </div>
    ),
    description: "Card Description",
    children: (
      <div className="flex flex-col gap-2">
        <p>
          This is some content inside the card. This can be a paragraph, a list,
          a table, or any other content!
        </p>
      </div>
    ),
  },
};
export const IconCentered: Story = {
  args: {
    title: "Card Title",
    icon: (
      <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
        <CheckCircle2 className="size-6 text-success-foreground" />
      </div>
    ),
    justify: "centered",
    description: "Card Description",
    children: (
      <div className="flex flex-col gap-2">
        <p>
          This is some content inside the card. This can be a paragraph, a list,
          a table, or any other content!
        </p>
      </div>
    ),
  },
};
