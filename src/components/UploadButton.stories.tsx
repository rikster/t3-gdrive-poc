import type { Meta, StoryObj } from "@storybook/react";
import { UploadButton } from "./UploadButton";

const meta = {
  title: "Components/UploadButton",
  component: UploadButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UploadButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => alert("Upload button clicked!"),
  },
};

export const CustomClass: Story = {
  args: {
    onClick: () => alert("Upload button clicked!"),
    className: "bg-purple-600 hover:bg-purple-700",
  },
};
