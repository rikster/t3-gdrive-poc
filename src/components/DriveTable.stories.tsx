import type { Meta, StoryObj } from "@storybook/react";

import type { DriveItem } from "~/types/drive";

import { DriveTable } from "./DriveTable";

const meta = {
  title: "Components/DriveTable",
  component: DriveTable,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DriveTable>;

export default meta;
type Story = StoryObj<typeof DriveTable>;

const mockItems: DriveItem[] = [
  {
    id: "1",
    name: "Document.pdf",
    modifiedAt: "2025-04-11T02:54:37Z",
    size: "1024",
    service: "google" as const,
    accountId: "user@gmail.com",
    type: "file" as const,
    parentId: "root",
  },
  {
    id: "2",
    name: "Images",
    modifiedAt: "2025-04-10T02:54:37Z",
    size: "0",
    service: "dropbox" as const,
    accountId: "user@example.com",
    type: "folder" as const,
    parentId: "root",
  },
];

const mockServiceAccounts = {
  google: [{ id: "user@gmail.com", service: "google" as const, name: "John Doe", email: "user@gmail.com" }],
  dropbox: [{ id: "user@example.com", service: "dropbox" as const, name: "John Doe", email: "user@example.com" }],
};

export const Empty: Story = {
  args: {
    items: [],
    isLoading: false,
    serviceAccounts: {},
    isRecursiveSearch: false,
    clearSearch: () => {},
    handleFolderClick: () => {},
    openFile: () => {},
    onRetry: () => {},
  },
};

export const Loading: Story = {
  args: {
    ...Empty.args,
    isLoading: true,
  },
};

export const WithItems: Story = {
  args: {
    ...Empty.args,
    items: mockItems,
    serviceAccounts: mockServiceAccounts,
  },
};

export const WithError: Story = {
  args: {
    ...Empty.args,
    error: "Failed to load files",
  },
};

export const WithSearch: Story = {
  args: {
    ...WithItems.args,
    searchQuery: "doc",
    isRecursiveSearch: true,
  },
};

export const NoSearchResults: Story = {
  args: {
    ...Empty.args,
    searchQuery: "nonexistent",
  },
};
