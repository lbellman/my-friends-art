import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";
import DropdownMenu from "@/components/atoms/dropdown-menu/DropdownMenu";
import { LayoutGrid, LogOut, Settings, User } from "lucide-react";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/atoms/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    items: [
      {
        key: "item-1",
        label: "Item 1",
        onClick: () => console.log("Item 1 clicked"),
      },
    ],
    trigger: <Button variant="default">Dropdown Menu</Button>,
  },
  argTypes: {
    items: {
      control: "object",
      description: "Items to display in the dropdown menu",
    },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    items: [
      {
        key: "account",
        label: "Account",
        onClick: () => console.log("Item 1 clicked"),
        icon: <User className="size-4" />
      },
      {
        key: "Dashboard",
        label: "Dashboard",
        onClick: () => console.log("Item 1 clicked"),
        icon: <LayoutGrid className="size-4" />
      },
      {
        key: "settings",
        label: "Settings",

        onClick: () => console.log("Item 1 clicked"),
        icon: <Settings className="size-4" />
      },
      {
        key: "signout",
        label: "Sign Out",

        onClick: () => console.log("Item 1 clicked"),
        icon: <LogOut className="size-4" />
      },
    ],
    trigger: <Button variant="default">
      <User className="size-4" />
    </Button>,
    header: "Lindsey Bellman",
  },
};
