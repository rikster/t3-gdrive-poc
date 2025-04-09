import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ErrorDialog } from './ErrorDialog';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Components/ErrorDialog',
  component: ErrorDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open',
    },
    onOpenChange: {
      action: 'openChanged',
      description: 'Function called when the open state changes',
    },
    title: {
      control: 'text',
      description: 'Title of the error dialog',
    },
    message: {
      control: 'text',
      description: 'Error message to display',
    },
  },
} satisfies Meta<typeof ErrorDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive example with a trigger button
export function Interactive() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="flex flex-col items-center gap-4">
      <Button 
        variant="destructive" 
        onClick={() => setOpen(true)}
      >
        Show Error Dialog
      </Button>
      <ErrorDialog
        open={open}
        onOpenChange={setOpen}
        title="Account Error"
        message="An account with this email already exists. Please use a different account."
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Error',
    message: 'Something went wrong. Please try again later.',
  },
};

export const DuplicateAccount: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Duplicate Account',
    message: 'An account with this email (user@example.com) already exists.',
  },
};

export const LongMessage: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Connection Error',
    message: 'We encountered an error while trying to connect to your account. This could be due to network connectivity issues, expired authentication tokens, or service outages. Please check your connection and try again.',
  },
};
