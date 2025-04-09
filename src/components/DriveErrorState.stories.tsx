import type { Meta, StoryObj } from '@storybook/react';
import { DriveErrorState } from './DriveErrorState';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/DriveErrorState',
  component: DriveErrorState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    onRetry: {
      action: 'retried',
      description: 'Function to call when retry button is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof DriveErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    error: 'Failed to load drive items',
    onRetry: action('retry-clicked'),
  },
  render: (args) => (
    <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <DriveErrorState {...args} />
    </div>
  ),
};

export const WithoutRetry: Story = {
  args: {
    error: 'Authentication failed. Please sign in again.',
  },
  render: (args) => (
    <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <DriveErrorState {...args} />
    </div>
  ),
};

export const LongErrorMessage: Story = {
  args: {
    error: 'Failed to connect to multiple cloud services. This could be due to network connectivity issues, expired authentication tokens, or service outages. Please check your connection and try again.',
    onRetry: action('retry-clicked'),
  },
  render: (args) => (
    <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <DriveErrorState {...args} />
    </div>
  ),
};

export const InDriveUI: Story = {
  args: {
    error: 'Failed to load files from one or more services',
    onRetry: action('retry-clicked'),
  },
  render: (args) => (
    <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <DriveErrorState {...args} />
    </div>
  ),
};
