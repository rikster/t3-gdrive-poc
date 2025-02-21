import type { Meta, StoryObj } from '@storybook/react';
import { DriveUI } from './DriveUI';
import { mockDriveData } from '../lib/mock-data';

const meta = {
  title: 'Components/DriveUI',
  component: DriveUI,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
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
