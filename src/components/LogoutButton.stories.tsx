import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import React from 'react';

import { DriveContext, type DriveContextType } from '../contexts/DriveContext';

import { LogoutButton } from './LogoutButton';

// Mock the DriveContext values
const createMockDriveContextValue = (isAuthenticated: boolean): DriveContextType => ({
  isAuthenticated,
  isClerkAuthenticated: isAuthenticated,
  authenticateService: () => undefined,
  addNewAccount: () => undefined,
  disconnectService: () => undefined,
  disconnectAccount: () => undefined,
  logout: () => { /* Logout function called */ }, // Mock logout function
  currentService: 'googledrive',
  activeServices: ['googledrive', 'onedrive'],
  serviceAccounts: [], // Mock empty service accounts array
  isAuthenticating: false,
  searchQuery: "",
  setSearchQuery: () => undefined,
  isSearching: false,
  searchResults: [],
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  performSearch: async () => { /* no-op */ },
  clearSearch: () => undefined,
  isRecursiveSearch: false,
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  openFile: async () => { /* no-op */ }
});

// Create a decorator with mocked DriveContext
const withMockedDriveContext = (isAuthenticated: boolean) => 
  (StoryComponent: React.ComponentType): React.ReactElement => {
    const WrappedStory = () => (
      <DriveContext.Provider value={createMockDriveContextValue(isAuthenticated)}>
        <StoryComponent />
      </DriveContext.Provider>
    );
    WrappedStory.displayName = 'WrappedStory';
    return <WrappedStory />;
  };

const meta = {
  title: 'Components/LogoutButton',
  component: LogoutButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A button component that allows authenticated users to log out of the application.
It uses the Clerk authentication system through the DriveContext.

## Features
- Automatically hides when user is not authenticated
- Customizable appearance (size, variant)
- Responsive text display (hidden on small screens)
- Consistent styling with shadcn/ui components
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LogoutButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default state shows a standard outline logout button.
 * This is the most common usage of the component.
 * 
 * When clicked, the button will trigger the logout function from the DriveContext.
 */
export const Default: Story = {
  decorators: [withMockedDriveContext(true)],
  render: () => (
    <div className="p-4">
      <LogoutButton />
    </div>
  ),
  play: ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    
    // Find the logout button
    const logoutButton = canvas.getByRole('button');
    
    // Click the button
    step('Click the logout button', async () => {
      await userEvent.click(logoutButton);
      // In a real scenario, this would trigger the logout function
      // We can't actually verify the action in this test environment
      // but this demonstrates how to interact with the component
    });
  },
};

/**
 * This variant demonstrates the button with a different variant style.
 * Using the destructive variant makes the logout action more prominent.
 * 
 * When clicked, the button will trigger the logout function from the DriveContext.
 */
export const Destructive: Story = {
  decorators: [withMockedDriveContext(true)],
  render: () => (
    <div className="p-4">
      <LogoutButton variant="destructive" />
    </div>
  ),
  play: ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    
    // Find the logout button
    const logoutButton = canvas.getByRole('button');
    
    // Click the button
    step('Click the logout button', async () => {
      await userEvent.click(logoutButton);
      // In a real scenario, this would trigger the logout function
      // We can't actually verify the action in this test environment
      // but this demonstrates how to interact with the component
    });
  },
};

/**
 * This variant demonstrates the button with a different size.
 * The default size is "sm" (small), but you can use "default" for a medium-sized button.
 * 
 * When clicked, the button will trigger the logout function from the DriveContext.
 */
export const DefaultSize: Story = {
  decorators: [withMockedDriveContext(true)],
  render: () => (
    <div className="p-4">
      <LogoutButton size="default" />
    </div>
  ),
  play: ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    
    // Find the logout button
    const logoutButton = canvas.getByRole('button');
    
    // Click the button
    step('Click the logout button', async () => {
      await userEvent.click(logoutButton);
      // In a real scenario, this would trigger the logout function
      // We can't actually verify the action in this test environment
      // but this demonstrates how to interact with the component
    });
  },
};

/**
 * This variant demonstrates the button with text always visible.
 * By default, the text is hidden on small screens, but you can set showText to true to always show it.
 * 
 * When clicked, the button will trigger the logout function from the DriveContext.
 */
export const AlwaysShowText: Story = {
  decorators: [withMockedDriveContext(true)],
  render: () => (
    <div className="p-4">
      <LogoutButton showText={true} />
    </div>
  ),
  play: ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    
    // Find the logout button
    const logoutButton = canvas.getByRole('button');
    
    // Click the button
    step('Click the logout button', async () => {
      await userEvent.click(logoutButton);
      // In a real scenario, this would trigger the logout function
      // We can't actually verify the action in this test environment
      // but this demonstrates how to interact with the component
    });
  },
};

/**
 * This variant demonstrates how the component behaves when the user is not authenticated.
 * The button will not be rendered at all.
 */
export const NotAuthenticated: Story = {
  decorators: [withMockedDriveContext(false)],
  render: () => (
    <div className="p-4 border border-dashed border-gray-300 rounded min-h-[50px] flex items-center justify-center">
      <span className="text-gray-400">Button not visible when not authenticated</span>
    </div>
  ),
};
