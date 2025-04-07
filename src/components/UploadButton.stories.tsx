import type { Meta, StoryObj } from "@storybook/react";
import { UploadButton } from "./UploadButton";
import { expect } from "@storybook/test";
import { within } from "@storybook/testing-library";

const meta = {
  title: "Components/UploadButton",
  component: UploadButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A reusable button component for file upload functionality. 
This component works with both light and dark themes through the shadcn/ui Button component.

- Uses Lucide React's Upload icon
- Accepts onClick handler for upload functionality
- Supports custom styling through className prop
- Automatically adapts to light/dark themes
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "clicked" },
    className: { control: "text" },
  },
} satisfies Meta<typeof UploadButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default state shows a standard primary upload button.
 * This is the most common usage of the component.
 */
export const Default: Story = {
  args: {
    onClick: () => alert("Upload button clicked!"),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    
    await step("Verify button exists", async () => {
      const button = canvas.getByRole("button");
      await expect(button).toBeInTheDocument();
      await expect(button).toHaveTextContent("Upload");
    });
  },
};

/**
 * This variant demonstrates the button with custom styling.
 * You can use Tailwind classes to customize the appearance.
 */
export const CustomClass: Story = {
  args: {
    onClick: () => alert("Upload button clicked!"),
    className: "bg-purple-600 hover:bg-purple-700",
  },
};

/**
 * This variant demonstrates the button with a destructive style.
 * Useful for showing upload actions that might overwrite existing files.
 */
export const Destructive: Story = {
  args: {
    onClick: () => alert("Upload button clicked!"),
    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
};
