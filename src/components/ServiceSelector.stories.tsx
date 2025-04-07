import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { ServiceSelector } from "./ServiceSelector";

const meta = {
  title: "Components/ServiceSelector",
  component: ServiceSelector,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A dropdown menu component that displays connected cloud storage services and their accounts.
It allows users to disconnect individual accounts or entire services.

## Features
- Displays all connected services in a dropdown menu
- Groups multiple accounts per service in nested submenus
- Provides options to disconnect individual accounts or entire services
- Adapts UI based on number of accounts per service
- Consistent styling with shadcn/ui components
        `,
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ServiceSelector>;

// We'll use this play function in the MultipleAccounts story to demonstrate interactions

export default meta;
type Story = StoryObj<typeof meta>;

// Actions are defined inline in each story

/**
 * Basic example with a single service and a single account.
 */
export const SingleService: Story = {
  args: {
    activeServices: ["google"],
    serviceAccounts: [
      {
        id: "account1",
        service: "google",
        name: "Personal",
        email: "user@example.com",
      },
    ],
    onDisconnectService: action("disconnectService"),
    onDisconnectAccount: action("disconnectAccount"),
  },
  render: (args) => (
    <div className="p-4">
      <ServiceSelector {...args} />
    </div>
  ),
};

/**
 * Example with multiple services, each with a single account.
 */
export const MultipleServices: Story = {
  args: {
    activeServices: ["google", "onedrive", "dropbox"],
    serviceAccounts: [
      {
        id: "account1",
        service: "google",
        name: "Personal",
        email: "google@example.com",
      },
      {
        id: "account2",
        service: "onedrive",
        name: "Work",
        email: "onedrive@example.com",
      },
      {
        id: "account3",
        service: "dropbox",
        name: "Shared",
        email: "dropbox@example.com",
      },
    ],
    onDisconnectService: action("disconnectService"),
    onDisconnectAccount: action("disconnectAccount"),
  },
  render: (args) => (
    <div className="p-4">
      <ServiceSelector {...args} />
    </div>
  ),
};

/**
 * Example with a service that has multiple accounts, demonstrating the nested submenu.
 */
export const MultipleAccounts: Story = {
  play: async ({ _canvasElement }) => {
    // This is where you would add interaction testing code
    // For example, using the @storybook/testing-library
    // Example (commented out):
    // const canvas = within(canvasElement);
    // await userEvent.click(canvas.getByRole('button'));
    // This would trigger the action in the Actions panel
  },
  args: {
    activeServices: ["google", "onedrive"],
    serviceAccounts: [
      {
        id: "account1",
        service: "google",
        name: "Personal",
        email: "personal@gmail.com",
      },
      {
        id: "account2",
        service: "google",
        name: "Work",
        email: "work@gmail.com",
      },
      {
        id: "account3",
        service: "google",
        name: "School",
        email: "school@gmail.com",
      },
      {
        id: "account4",
        service: "onedrive",
        name: "Personal OneDrive",
        email: "personal@outlook.com",
      },
    ],
    onDisconnectService: action("disconnectService"),
    onDisconnectAccount: action("disconnectAccount"),
  },
  render: (args) => (
    <div className="p-4">
      <ServiceSelector {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "This story demonstrates how the component handles multiple accounts for a single service, showing the nested submenu structure."
      }
    },
  },
};

/**
 * Example with multiple services, some with multiple accounts.
 */
export const MixedAccounts: Story = {
  args: {
    activeServices: ["google", "onedrive", "dropbox", "box"],
    serviceAccounts: [
      {
        id: "account1",
        service: "google",
        name: "Personal",
        email: "personal@gmail.com",
      },
      {
        id: "account2",
        service: "google",
        name: "Work",
        email: "work@gmail.com",
      },
      {
        id: "account3",
        service: "onedrive",
        name: "Personal OneDrive",
        email: "personal@outlook.com",
      },
      {
        id: "account4",
        service: "onedrive",
        name: "Work OneDrive",
        email: "work@outlook.com",
      },
      {
        id: "account5",
        service: "dropbox",
        name: "Dropbox",
        email: "dropbox@example.com",
      },
      {
        id: "account6",
        service: "box",
        name: "Box",
        email: "box@example.com",
      },
    ],
    onDisconnectService: action("disconnectService"),
    onDisconnectAccount: action("disconnectAccount"),
  },
  render: (args) => (
    <div className="p-4">
      <ServiceSelector {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "A real-world example showing a mix of services, some with single accounts and others with multiple accounts."
      }
    },
  },
};

/**
 * Example with accounts that have missing email or name properties.
 */
export const MissingData: Story = {
  args: {
    activeServices: ["google", "onedrive", "dropbox"],
    serviceAccounts: [
      {
        id: "account1",
        service: "google",
        // Missing name
        email: "google@example.com",
      },
      {
        id: "account2",
        service: "onedrive",
        name: "Work OneDrive",
        // Missing email
      },
      {
        id: "account3",
        service: "dropbox",
        // Missing both name and email
      },
    ],
    onDisconnectService: action("disconnectService"),
    onDisconnectAccount: action("disconnectAccount"),
  },
  render: (args) => (
    <div className="p-4">
      <ServiceSelector {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "This story demonstrates how the component handles missing data, such as when account email or name properties are not available."
      }
    },
  },
};
