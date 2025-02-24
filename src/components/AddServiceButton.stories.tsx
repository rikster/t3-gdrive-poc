import type { Meta, StoryObj } from "@storybook/react";
import { Cloud, Archive, Database } from "lucide-react";

import { AddServiceButton } from "./AddServiceButton";

const meta = {
  title: "Components/AddServiceButton",
  component: AddServiceButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A button component that allows users to add additional cloud storage services to their account.
It displays a dropdown menu with available services when clicked.

## Features
- Customizable list of available services
- Optional icons for each service
- Accessible dropdown menu using Radix UI
- Consistent styling with shadcn/ui components
        `,
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AddServiceButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default state shows a list of predefined services without icons.
 * This is useful when you want to quickly implement the component without customizing the services.
 */
export const Default: Story = {
  render: () => (
    <div className="p-4">
      <AddServiceButton
        onServiceSelect={(serviceId) => {
          console.log("Selected service:", serviceId);
        }}
      />
    </div>
  ),
};

/**
 * This variant demonstrates how to add icons to each service.
 * Icons help users quickly identify different services in the dropdown menu.
 * 
 * We're using Lucide icons here, but you can use any React component as an icon.
 */
export const WithIcons: Story = {
  render: () => (
    <div className="p-4">
      <AddServiceButton
        availableServices={[
          {
            id: "onedrive",
            name: "OneDrive",
            icon: <Cloud className="h-4 w-4" />,
          },
          {
            id: "dropbox",
            name: "Dropbox",
            icon: <Archive className="h-4 w-4" />,
          },
          {
            id: "box",
            name: "Box",
            icon: <Database className="h-4 w-4" />
          },
        ]}
        onServiceSelect={(serviceId) => {
          console.log("Selected service:", serviceId);
        }}
      />
    </div>
  ),
};

/**
 * This variant shows how to use the component with a single service.
 * This can be useful when you want to limit the available services or
 * implement a staged rollout of different services.
 */
export const SingleService: Story = {
  render: () => (
    <div className="p-4">
      <AddServiceButton
        availableServices={[
          {
            id: "onedrive",
            name: "OneDrive",
            icon: <Cloud className="h-4 w-4" />,
          },
        ]}
        onServiceSelect={(serviceId) => {
          console.log("Selected service:", serviceId);
        }}
      />
    </div>
  ),
};
