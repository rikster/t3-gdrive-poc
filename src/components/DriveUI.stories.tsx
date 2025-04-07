import type { Meta, StoryObj } from "@storybook/react";
import { DriveUI } from "./DriveUI";
import { mockDriveData } from "../lib/mock-data";
import { DriveContext, DriveContextType } from "../contexts/DriveContext";
import React from "react";

// Mock the DriveContext values
const mockDriveContextValue: DriveContextType = {
  isAuthenticated: true,
  isClerkAuthenticated: true,
  authenticateService: () => {}, // Mock function
  addNewAccount: () => {}, // Mock function
  disconnectService: () => {}, // Mock function
  disconnectAccount: () => {}, // Mock function
  logout: () => {}, // Mock function
  currentService: "googledrive",
  activeServices: ["googledrive", "onedrive"],
  serviceAccounts: [
    {
      id: "account1",
      service: "googledrive",
      name: "Work Account",
      email: "work@example.com",
    },
    {
      id: "account2",
      service: "onedrive",
      name: "Personal Account",
      email: "personal@example.com",
    },
  ],
  isAuthenticating: false,
  searchQuery: "",
  setSearchQuery: () => {}, // Mock function
  isSearching: false,
  searchResults: [],
  performSearch: async () => {}, // Mock function
  clearSearch: () => {}, // Mock function
  isRecursiveSearch: false,
  openFile: async () => {}, // Mock function
};

// Create a decorator with mocked DriveContext
const withMockedDriveContext = (Story: React.ComponentType) => (
  <DriveContext.Provider value={mockDriveContextValue}>
    <Story />
  </DriveContext.Provider>
);

const meta = {
  title: "Components/DriveUI",
  component: DriveUI,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [withMockedDriveContext], // Add the decorator to all stories
} satisfies Meta<typeof DriveUI>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: mockDriveData,
    loading: false,
    error: null,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default view showing files and folders with breadcrumb navigation at root level.",
      },
    },
  },
};

export const Loading: Story = {
  args: {
    items: [],
    loading: true,
    error: null,
  },
};

export const Error: Story = {
  args: {
    items: [],
    loading: false,
    error: "Failed to load drive items",
  },
};

export const Empty: Story = {
  args: {
    items: [],
    loading: false,
    error: null,
  },
};

// Story with breadcrumb navigation showing a folder path
export const WithBreadcrumbs: Story = {
  args: {
    items: [
      {
        id: "file3",
        name: "Report.docx",
        type: "file",
        size: "1.5 MB",
        modifiedAt: "2025-02-15",
        parentId: "folder2",
        service: "googledrive",
        accountId: "account1",
        accountName: "Work Account",
        accountEmail: "work@example.com",
      },
      {
        id: "file4",
        name: "Presentation.pptx",
        type: "file",
        size: "3.2 MB",
        modifiedAt: "2025-02-14",
        parentId: "folder2",
        service: "googledrive",
        accountId: "account1",
        accountName: "Work Account",
        accountEmail: "work@example.com",
      },
    ],
    loading: false,
    error: null,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the UI with breadcrumb navigation when inside a nested folder structure.",
      },
    },
  },
  // Initialize the breadcrumb path for this story
  play: async ({ canvasElement }) => {
    // This simulates navigating to Documents > Projects folder
    const driveUI = canvasElement.querySelector(".flex-none");
    if (driveUI) {
      // We can't directly set state in Storybook, but this would simulate
      // the breadcrumb path being set after navigation
      console.log(
        "Breadcrumb navigation would show: Home > Documents > Projects",
      );
    }
  },
};
