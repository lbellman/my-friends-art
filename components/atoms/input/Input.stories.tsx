import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";
import Input from "@/components/atoms/input/Input";
import { LayoutGrid, LogOut, Settings, User } from "lucide-react";

const meta: Meta<typeof Input> = {
  title: "Components/atoms/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    value: "Lindsey Bellman",
    onChange: () => console.log("Input changed"),
    disabled: false,
    placeholder: "Enter your name",
    label: "Name",
    id: "name",
    required: false,
  },
  argTypes: {
    value: {
      control: "text",
      description: "Value of the input",
    },
    onChange: {
      control: "object",
      description: "Function to call when the input changes",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text for the input",
    },
    label: {
      control: "text",
      description: "Label for the input",
    },
    id: {
      control: "text",
      description: "ID for the input",
    },
    required: {
      control: "boolean",
      description: "Whether the input is required",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "",
    onChange: () => console.log("Input changed"),
    disabled: false,
    placeholder: "Enter your name",
    label: "Name",
    id: "name",
    required: false,
  },
};
export const Required: Story = {
  args: {
    value: "",
    onChange: () => console.log("Input changed"),
    disabled: false,
    placeholder: "Enter your name",
    label: "Name",
    id: "name",
    required: true,
  },
};
export const Disabled: Story = {
  args: {
    value: "",
    onChange: () => console.log("Input changed"),
    disabled: true,
    placeholder: "Enter your name",
    label: "Name",
    id: "name",
    required: false,
  },
};
