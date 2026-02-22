import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/atoms/button/Button";
import { User } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "Components/atoms/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    variant: "primary",
  },
  argTypes: {
    variant: {
      control: "select",
      description: "Button variants",
      options: ["primary", "secondary", "destructive"],
    },
    size: {
      control: "select",
      description: "Button sizes",
      options: ["xs", "sm", "default", "lg"],
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    onClick: {
      action: "Button clicked",
    },
    label: {
      control: "text",
      description: "Button label",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    label: "Primary Button",
  },
};
export const Secondary: Story = {
  args: {
    variant: "secondary",
    label: "Secondary Button",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    label: "Destructive Button",
  },
};

export const WithIcon: Story = {
  args: {
    variant: "primary",
    icon: <User />,
    label: "Icon Button",
  },
};
export const Icon: Story = {
  args: {
    variant: 'secondary',
    icon: <User />,
  },
};
