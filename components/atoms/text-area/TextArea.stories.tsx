import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import TextArea from "@/components/atoms/text-area/TextArea";

const meta: Meta<typeof TextArea> = {
  title: "Components/atoms/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    value:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    onChange: () => console.log("TextArea changed"),
    disabled: false,
    placeholder: "Enter your text...",
    label: "Text",
    id: "text",
    required: false,
  },
  argTypes: {
    value: {
      control: "text",
      description: "Value of the text area",
    },
    onChange: {
      control: "object",
      description: "Function to call when the text area changes",
    },
    disabled: {
      control: "boolean",
      description: "Whether the text area is disabled",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text for the text area",
    },
    label: {
      control: "text",
      description: "Label for the text area",
    },
    id: {
      control: "text",
      description: "ID for the text area",
    },
    required: {
      control: "boolean",
      description: "Whether the text area is required",
    },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "",
    onChange: () => console.log("TextArea changed"),
    disabled: false,
    placeholder: "Tell us about your art and what it means to you...",
    label: "Artist Bio",
    id: "text",
    required: false,
  },
};
export const Required: Story = {
  args: {
    value: "",
    onChange: () => console.log("TextArea changed"),
    disabled: false,
    placeholder: "Tell us about your art and what it means to you...",
    label: "Artist Bio",
    id: "text",
    required: true,
  },
};
export const Disabled: Story = {
  args: {
    value: "",
    onChange: () => console.log("TextArea changed"),
    disabled: true,
    placeholder: "Tell us about your art and what it means to you...",
    label: "Artist Bio",
    id: "text",
    required: false,
  },
};
