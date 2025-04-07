import type { Meta, StoryObj } from "@storybook/react";
import { DriveBreadcrumb } from "./DriveBreadcrumb";
import { expect } from "@storybook/test";
import { within, userEvent } from "@storybook/testing-library";

const meta = {
  title: "Components/DriveBreadcrumb",
  component: DriveBreadcrumb,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A navigation breadcrumb component that displays the current folder path and allows users to navigate to parent folders.
`,
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DriveBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { id: "folder1", name: "Documents" },
      { id: "folder2", name: "Projects" },
      { id: "folder3", name: "React" },
    ],
    currentFolder: "folder3",
    onNavigate: (item) => console.log("Navigate to:", item),
  },
};

export const SingleLevel: Story = {
  args: {
    items: [{ id: "folder1", name: "Documents" }],
    currentFolder: "folder1",
    onNavigate: (item) => console.log("Navigate to:", item),
  },
};

export const RootLevel: Story = {
  args: {
    items: [],
    currentFolder: "root",
    onNavigate: (item) => console.log("Navigate to:", item),
  },
};

export const LongNames: Story = {
  args: {
    items: [
      { id: "folder1", name: "Documents" },
      { id: "folder2", name: "Very Long Folder Name That Should Be Truncated" },
      { id: "folder3", name: "Another Long Name For Testing Truncation" },
    ],
    currentFolder: "folder3",
    onNavigate: (item) => console.log("Navigate to:", item),
  },
};

export const WithServiceInfo: Story = {
  args: {
    items: [
      { id: "folder1", name: "Documents", service: "google", accountId: "acc1" },
      { id: "folder2", name: "Projects", service: "google", accountId: "acc1" },
      { id: "folder3", name: "React", service: "google", accountId: "acc1" },
    ],
    currentFolder: "folder3",
    onNavigate: (item) => console.log("Navigate to:", item),
  },
};
