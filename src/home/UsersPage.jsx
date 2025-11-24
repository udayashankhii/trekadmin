import React from 'react';
import { Users, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button icon={<Plus size={18} />}>Add New User</Button>
      </div>
      <Card>
        <div className="text-center py-12 text-slate-500">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>Users management coming soon</p>
        </div>
      </Card>
    </div>
  );
};

export default UsersPage
