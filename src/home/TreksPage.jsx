import React, { useState } from 'react';

import {
  Plus,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Badge from '../components/ui/badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Dropdown from '../components/ui/Dropdown';

const TreksPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const columns = [
    {
      key: 'name',
      header: 'Trek Name',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.duration}</p>
        </div>
      ),
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      render: (row) => (
        <Badge
          variant={row.difficulty === 'Hard'
            ? 'danger'
            : row.difficulty === 'Moderate'
              ? 'warning'
              : 'success'}
        >
          {row.difficulty}
        </Badge>
      ),
    },
    { key: 'price', header: 'Price' },
    { key: 'bookings', header: 'Bookings' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <Dropdown
          trigger={
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical size={18} />
            </button>
          }
        >
          <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            <Eye size={16} /> View
          </button>
          <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            <Edit size={16} /> Edit
          </button>
          <button className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
            <Trash2 size={16} /> Delete
          </button>
        </Dropdown>
      ),
    }
  ];

  const data = [
    { name: 'Everest Base Camp', duration: '14 days', difficulty: 'Hard', price: '$1,899', bookings: '48', status: 'Active' },
    { name: 'Annapurna Circuit', duration: '12 days', difficulty: 'Moderate', price: '$1,499', bookings: '62', status: 'Active' },
    { name: 'Langtang Valley', duration: '8 days', difficulty: 'Easy', price: '$899', bookings: '34', status: 'Active' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          icon={<Plus size={18} />}
          onClick={() => setModalOpen(true)}
        >
          Add New Trek
        </Button>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<Filter size={18} />}>Filter</Button>
            <Button variant="secondary" icon={<Download size={18} />}>Export</Button>
          </div>
        </div>
        <Table columns={columns} data={data} />
      </Card>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Trek"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button>Create Trek</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trek Name
            </label>
            <Input placeholder="Enter trek name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
              <Input placeholder="e.g. 14 days" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Price</label>
              <Input placeholder="e.g. $1,899" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
              rows="4"
              placeholder="Enter trek description"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TreksPage
