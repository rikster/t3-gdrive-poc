import type { Meta, StoryObj } from '@storybook/react';
import { DriveBreadcrumb } from './DriveBreadcrumb';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/DriveBreadcrumb',
  component: DriveBreadcrumb,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A navigation breadcrumb component that shows the path to folders and files across different services and accounts.
It allows users to navigate back to previous folders in the path.

## Features
- Shows the current path to folders and files
- Allows navigation back to previous folders
- Supports navigation across different services and accounts
- Responsive design with truncation for long folder names
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onNavigate: { action: 'navigated' },
  },
} satisfies Meta<typeof DriveBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        id: 'folder1',
        name: 'Documents',
        service: 'googledrive',
      },
    ],
    currentFolder: 'folder1',
    onNavigate: action('navigated'),
    className: '',
  },
};

export const MultipleLevels: Story = {
  args: {
    items: [
      {
        id: 'folder1',
        name: 'Documents',
        service: 'googledrive',
      },
      {
        id: 'folder2',
        name: 'Projects',
        service: 'googledrive',
      },
      {
        id: 'folder3',
        name: 'Q1 Reports',
        service: 'googledrive',
      },
    ],
    currentFolder: 'folder3',
    onNavigate: action('navigated'),
    className: '',
  },
};

export const LongFolderNames: Story = {
  args: {
    items: [
      {
        id: 'folder1',
        name: 'Very Long Folder Name That Should Be Truncated',
        service: 'googledrive',
      },
      {
        id: 'folder2',
        name: 'Another Extremely Long Folder Name That Needs Truncation',
        service: 'googledrive',
      },
    ],
    currentFolder: 'folder2',
    onNavigate: action('navigated'),
    className: '',
  },
};

export const DifferentServices: Story = {
  args: {
    items: [
      {
        id: 'folder1',
        name: 'Documents',
        service: 'googledrive',
        accountId: 'account1',
      },
      {
        id: 'folder2',
        name: 'Shared',
        service: 'onedrive',
        accountId: 'account2',
      },
    ],
    currentFolder: 'folder2',
    onNavigate: action('navigated'),
    className: '',
  },
};

export const AtRootLevel: Story = {
  args: {
    items: [],
    currentFolder: 'root',
    onNavigate: action('navigated'),
    className: '',
  },
};
