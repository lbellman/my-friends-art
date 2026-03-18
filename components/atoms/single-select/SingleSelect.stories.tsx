import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SingleSelect from "@/components/atoms/single-select/SingleSelect";
import { MEDIUM_OPTIONS } from "@/@types";

const meta: Meta<typeof SingleSelect> = {
  title: "Components/atoms/SingleSelect",
  component: SingleSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    value: "",
    onChange: () => console.log("SingleSelect changed"),
    disabled: false,
    placeholder: "Select an option",
    label: "Select an option",
    id: "select-option",
    required: false,
    options: [
      {
        key: "Option 1",
        label: "option1",
      },
      {
        key: "Option 2",
        label: "option2",
      },
    ],
  },
  argTypes: {
    value: {
      control: "text",
      description: "Value of the single select",
    },
    onChange: {
      control: "object",
      description: "Function to call when the single select changes",
    },
    disabled: {
      control: "boolean",
      description: "Whether the single select is disabled",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text for the single select",
    },
    label: {
      control: "text",
      description: "Label for the single select",
    },
    id: {
      control: "text",
      description: "ID for the single select",
    },
    required: {
      control: "boolean",
      description: "Whether the single select is required",
    },
  },
} satisfies Meta<typeof SingleSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const mediumOptions = Object.entries(MEDIUM_OPTIONS).map(([key, value]) => ({
  key,
  label: value,
}));

export const Default: Story = {
  args: {
    value: "",
    onChange: () => console.log("SingleSelect changed"),
    disabled: false,
    placeholder: "Select an option...",
    label: "Medium",
    id: "select-option",
    required: false,
    options: mediumOptions,
  },
};
export const Required: Story = {
  args: {
    value: "",
    onChange: () => console.log("SingleSelect changed"),
    disabled: false,
    placeholder: "Select an option...",
        label: "Medium",
    id: "select-option",
    required: true,
    options: mediumOptions,
  },
};
export const Disabled: Story = {
  args: {
    value: "",
    onChange: () => console.log("SingleSelect changed"),
    disabled: true,
    placeholder: "Select an option...",
    label: "Medium",
    id: "select-option",
    required: false,
    options: mediumOptions,
  },
};
