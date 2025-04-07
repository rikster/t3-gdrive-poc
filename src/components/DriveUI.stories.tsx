import type { Meta, StoryObj } from '@storybook/react';
import { DriveUI } from './DriveUI';
import { mockDriveData } from '../lib/mock-data';
import { DriveContext, DriveContextType } from '../contexts/DriveContext';
import React from 'react';

// Mock the DriveContext values
const mockDriveContextValue: DriveContextType = {
  isAuthenticated: true,
  isClerkAuthenticated: true,
  authenticateService: () => {}, // Mock function
  addNewAccount: () => {}, // Mock function
  disconnectService: () => {}, // Mock function
  disconnectAccount: () => {}, // Mock function
  logout: () => {}, // Mock function
  currentService: 'googledrive',
  activeServices: ['googledrive', 'onedrive'],
  serviceAccounts: [], // Mock empty service accounts array
  isAuthenticating: false,
  searchQuery: "",
  setSearchQuery: () => {}, // Mock function
  isSearching: false,
  searchResults: [],
  performSearch: async () => {}, // Mock function
  clearSearch: () => {}, // Mock function
  isRecursiveSearch: false,
  openFile: async () => {} // Mock function
};

// Create a decorator with mocked DriveContext
const withMockedDriveContext = (Story: React.ComponentType) => (
  <DriveContext.Provider value={mockDriveContextValue}>
    <Story />
  </DriveContext.Provider>
);

const meta = {
  title: 'Components/DriveUI',
  component: DriveUI,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
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
    error: 'Failed to load drive items',
  },
};

export const Empty: Story = {
  args: {
    items: [],
    loading: false,
    error: null,
  },
};
