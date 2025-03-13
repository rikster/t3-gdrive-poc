import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from './loading-spinner';

const meta = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    spinnerSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the spinner',
    },
    fullScreen: {
      control: 'boolean',
      description: 'Whether to display the spinner in fullscreen mode',
    },
    containerClassName: {
      control: 'text',
      description: 'Additional classes for the container',
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <LoadingSpinner spinnerSize="md" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default medium-sized spinner.',
      },
    },
  },
};

export const Small: Story = {
  name: 'Small Spinner',
  render: () => (
    <div className="p-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <LoadingSpinner spinnerSize="sm" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A small spinner suitable for inline indicators or inside small UI elements.',
      },
    },
  },
};

export const Medium: Story = {
  name: 'Medium Spinner',
  render: () => (
    <div className="p-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <LoadingSpinner spinnerSize="md" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default medium-sized spinner suitable for most use cases.',
      },
    },
  },
};

export const Large: Story = {
  name: 'Large Spinner',
  render: () => (
    <div className="p-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <LoadingSpinner spinnerSize="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A large spinner for more prominent loading states.',
      },
    },
  },
};

export const WithCustomContainer: Story = {
  name: 'Custom Container',
  render: () => (
    <LoadingSpinner 
      spinnerSize="md" 
      containerClassName="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg border border-blue-100 dark:border-blue-800" 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinner with a custom container style using the containerClassName prop.',
      },
    },
  },
};

export const FullScreen: Story = {
  name: 'Full Screen Mode',
  args: {
    spinnerSize: 'lg',
    fullScreen: true,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'A fullscreen spinner overlay for page-level loading states.',
      },
    },
  },
};

// Example showing spinner in a card-like container
export const InCard: Story = {
  name: 'In Card Container',
  render: () => (
    <div className="border rounded-lg shadow-sm p-6 w-64 h-48 flex items-center justify-center bg-white dark:bg-gray-800 dark:border-gray-700">
      <LoadingSpinner spinnerSize="md" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing how to use the spinner inside a card component.',
      },
    },
  },
};

// Example showing multiple spinners with different sizes
export const SizeComparison: Story = {
  name: 'Size Comparison',
  render: () => (
    <div className="flex flex-col gap-6 items-center p-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Spinner Size Comparison</h3>
      <div className="flex gap-8 items-end">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-md">
            <LoadingSpinner spinnerSize="sm" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Small</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-md">
            <LoadingSpinner spinnerSize="md" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Medium</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-md">
            <LoadingSpinner spinnerSize="lg" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Large</span>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available spinner sizes side by side.',
      },
    },
  },
};

// Example showing a contextual use case for file loading
export const FileLoading: Story = {
  name: 'Cloud Storage Loading',
  render: () => (
    <div className="border rounded-lg p-4 w-full max-w-md bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <LoadingSpinner spinnerSize="sm" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading files from cloud storage...</span>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Fetching data from multiple services
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing the spinner in a cloud storage context, aligned with the app\'s Google Drive and OneDrive integration features.',
      },
    },
  },
};
