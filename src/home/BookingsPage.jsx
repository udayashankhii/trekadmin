import React from 'react';
import { Filter, Download } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/badge';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';

const BookingsPage = () => {
  const columns = [
    { key: 'id', header: 'Booking ID' },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.customer}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      )
    },
    { key: 'trek', header: 'Trek' },
    { key: 'date', header: 'Start Date' },
    { key: 'amount', header: 'Amount' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'Confirmed'
              ? 'success'
              : row.status === 'Pending'
              ? 'warning'
              : 'danger'
          }
        >
          {row.status}
        </Badge>
      )
    }
  ];

  const data = [
    { id: '#B001', customer: 'John Doe', email: 'john@example.com', trek: 'Everest Base Camp', date: 'Dec 15, 2024', amount: '$1,899', status: 'Confirmed' },
    { id: '#B002', customer: 'Jane Smith', email: 'jane@example.com', trek: 'Annapurna Circuit', date: 'Dec 20, 2024', amount: '$1,499', status: 'Pending' },
    { id: '#B003', customer: 'Mike Johnson', email: 'mike@example.com', trek: 'Langtang Valley', date: 'Jan 5, 2025', amount: '$899', status: 'Confirmed' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<Filter size={18} />}>Filter</Button>
            <Button variant="secondary" icon={<Download size={18} />}>Export</Button>
          </div>
        </div>
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
};

export default BookingsPage
