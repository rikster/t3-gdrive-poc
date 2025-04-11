import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import type { ServiceAccount, ServiceType } from "~/types/services";

import { ServiceSelector } from "./ServiceSelector";

// Helper function to create a service account with proper typing
const createServiceAccount = (
  service: "google" | "onedrive" | "dropbox",
  id: string,
  name: string,
  email: string,
): ServiceAccount => ({
  id,
  service,
  name,
  email,
});

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
    activeServices: ["google"] as const,
    serviceAccounts: {
      google: [
        createServiceAccount(
          "google",
          "account1",
          "Personal",
          "user@example.com",
        ),
      ],
      onedrive: [],
      dropbox: [],
    } satisfies Record<ServiceType, ServiceAccount[]>,
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
    serviceAccounts: {
      google: [
        {
          id: "account1",
          service: "google",
          name: "Personal",
          email: "google@example.com",
        },
      ],
      onedrive: [
        {
          id: "account2",
          service: "onedrive" as const,
          name: "Work",
          email: "onedrive@example.com",
        },
      ],
      dropbox: [
        {
          id: "account3",
          service: "dropbox" as const,
          name: "Shared",
          email: "dropbox@example.com",
        },
      ],
    },
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
    activeServices: ["google", "onedrive"] as const,
    serviceAccounts: {
      google: [
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
      ],
      onedrive: [
        {
          id: "account4",
          service: "onedrive",
          name: "Personal OneDrive",
          email: "personal@onedrive.com",
        },
      ],
      dropbox: [],
    },
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
        story:
          "This story demonstrates how the component handles multiple accounts for a single service, showing the nested submenu structure.",
      },
    },
  },
};

/**
 * Example with multiple services, some with multiple accounts.
 */
export const MixedAccounts: Story = {
  args: {
    activeServices: ["google", "onedrive", "dropbox"] as const,
    serviceAccounts: {
      // Cast service accounts to Record<string, ServiceAccount[]>
      google: [
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
      ],
      onedrive: [
        {
          id: "account3",
          service: "onedrive" as const,
          name: "Personal OneDrive",
          email: "personal@outlook.com",
        },
        {
          id: "account4",
          service: "onedrive" as const,
          name: "Work OneDrive",
          email: "work@outlook.com",
        },
      ],
      dropbox: [
        {
          id: "account5",
          service: "dropbox" as const,
          name: "Dropbox",
          email: "dropbox@example.com",
        },
      ],
    },
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
        story:
          "A real-world example showing a mix of services, some with single accounts and others with multiple accounts.",
      },
    },
  },
};

/**
 * Example with accounts that have missing email or name properties.
 */
export const MissingData: Story = {
  args: {
    activeServices: ["google", "onedrive", "dropbox"],
    serviceAccounts: {
      google: [
        {
          id: "account1",
          service: "google",
          // Missing name
          email: "google@example.com",
        },
      ],
      onedrive: [
        {
          id: "account2",
          service: "onedrive",
          name: "Work OneDrive",
          // Missing email
        },
      ],
      dropbox: [
        {
          id: "account3",
          service: "dropbox",
          // Missing both name and email
        },
      ],
    },
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
        story:
          "This story demonstrates how the component handles missing data, such as when account email or name properties are not available.",
      },
    },
  },
};
