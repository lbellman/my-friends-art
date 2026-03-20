import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ConfirmDialog from "@/components/organisms/confirm-dialog/ConfirmDialog";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Components/organisms/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    open: false,
    onOpenChange: () => {
      console.log("Opening dialog");
    },
    onConfirm: () => {
      console.log("Confirming action");
    },
    confirmVariant: "destructive",
    title: "Confirm Action",
    description: "Are you sure you want to confirm this action?",
    confirmLabel: "Confirm",
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Whether the dialog is open",
    },
    onOpenChange: {
      control: "object",
      description: "Function to open the dialog",
    },
    confirmVariant: {
      control: "select",
      options: ["destructive", "success", "default"],
      description: "Variant of the confirm button",
    },
    title: {
      control: "text",
      description: "Title of the dialog",
    },
    description: {
      control: "text",
      description: "Description of the dialog",
    },
    confirmLabel: {
      control: "text",
      description: "Label of the confirm button",
  }},
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {
      console.log("Opening dialog");
    },
    onConfirm: () => {
      console.log("Confirming action");
    },
    confirmVariant: "default",
    title: "Confirm Request",
    description: "Please look over your request details before confirming.",
    confirmLabel: "Confirm Request",
  },
};
export const Destructive: Story = {
  args: {
    open: true,
    onOpenChange: () => {
      console.log("Opening dialog");
    },
    onConfirm: () => {
      console.log("Confirming action");
    },
    confirmVariant: "destructive",
    title: "Delete Art Piece",
    description: "Are you sure you want to delete this art piece? This action cannot be undone.",
    confirmLabel: "Yes, delete this art piece",
  },
};
export const Success: Story = {
  args: {
    open: true,
    onOpenChange: () => {
      console.log("Opening dialog");
    },
    onConfirm: () => {
      console.log("Confirming action");
    },
    confirmVariant: "success",
    title: "Fulfill Print Request",
    description: "Marking this request as fulfilled means you have submitted an order with a print shop and the customer has received their print.",
    confirmLabel: "Yes, this request has been fulfilled",
  },
};

