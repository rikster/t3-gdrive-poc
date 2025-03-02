import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from './table';

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Table className="w-[500px]">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell>User</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Mark Johnson</TableCell>
          <TableCell>mark@example.com</TableCell>
          <TableCell>Manager</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithStyling: Story = {
  render: () => (
    <Table className="w-[600px] border border-gray-200 dark:border-gray-800">
      <TableHeader className="bg-gray-100 dark:bg-gray-800">
        <TableRow>
          <TableHead className="font-bold">Product</TableHead>
          <TableHead className="font-bold text-right">Price</TableHead>
          <TableHead className="font-bold text-right">Quantity</TableHead>
          <TableHead className="font-bold text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Laptop Pro</TableCell>
          <TableCell className="text-right">$1,499.00</TableCell>
          <TableCell className="text-right">1</TableCell>
          <TableCell className="text-right">$1,499.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Wireless Keyboard</TableCell>
          <TableCell className="text-right">$99.00</TableCell>
          <TableCell className="text-right">2</TableCell>
          <TableCell className="text-right">$198.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">USB-C Hub</TableCell>
          <TableCell className="text-right">$49.00</TableCell>
          <TableCell className="text-right">3</TableCell>
          <TableCell className="text-right">$147.00</TableCell>
        </TableRow>
        <TableRow className="bg-gray-50 dark:bg-gray-900">
          <TableCell colSpan={3} className="font-bold text-right">
            Total
          </TableCell>
          <TableCell className="font-bold text-right">$1,844.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithHover: Story = {
  render: () => (
    <Table className="w-[500px]">
      <TableHeader>
        <TableRow>
          <TableHead>File Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="cursor-pointer">
          <TableCell className="font-medium">document.pdf</TableCell>
          <TableCell>PDF</TableCell>
          <TableCell>2.5 MB</TableCell>
        </TableRow>
        <TableRow className="cursor-pointer">
          <TableCell className="font-medium">image.jpg</TableCell>
          <TableCell>Image</TableCell>
          <TableCell>4.2 MB</TableCell>
        </TableRow>
        <TableRow className="cursor-pointer">
          <TableCell className="font-medium">spreadsheet.xlsx</TableCell>
          <TableCell>Spreadsheet</TableCell>
          <TableCell>1.8 MB</TableCell>
        </TableRow>
        <TableRow className="cursor-pointer">
          <TableCell className="font-medium">presentation.pptx</TableCell>
          <TableCell>Presentation</TableCell>
          <TableCell>7.5 MB</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Compact: Story = {
  render: () => (
    <Table className="w-[500px]">
      <TableHeader>
        <TableRow>
          <TableHead className="py-2">ID</TableHead>
          <TableHead className="py-2">Status</TableHead>
          <TableHead className="py-2">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { id: 'INV-001', status: 'Paid', date: '2023-01-13' },
          { id: 'INV-002', status: 'Pending', date: '2023-01-15' },
          { id: 'INV-003', status: 'Processing', date: '2023-01-20' },
          { id: 'INV-004', status: 'Completed', date: '2023-01-28' },
          { id: 'INV-005', status: 'Cancelled', date: '2023-02-01' },
        ].map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="py-2 font-medium">{invoice.id}</TableCell>
            <TableCell className="py-2">{invoice.status}</TableCell>
            <TableCell className="py-2">{invoice.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
